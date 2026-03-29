import type {
  DraftTaskInput,
  DailyPlanResult,
  NextActionPick,
  NextActionResult,
} from "@/lib/types/agent";
import { buildDailyPlanDraft } from "@/lib/agent/daily-planner";
import { localDateKey } from "@/lib/agent/date-utils";
import { buildTaskReason, pickNextAction } from "@/lib/agent/next-action";
import { scoreTaskForPlanning } from "@/lib/agent/prioritizer";
import { structureCaptureFromText } from "@/lib/agent/task-structurer";
import { prisma } from "@/lib/db";

export function parseCaptureText(raw: string) {
  return structureCaptureFromText(raw, new Date());
}

export async function getBlockedTaskIds(): Promise<Set<string>> {
  const deps = await prisma.taskDependency.findMany({
    include: { dependsOnTask: { select: { status: true } } },
  });
  const blocked = new Set<string>();
  for (const d of deps) {
    if (d.dependsOnTask.status !== "done") blocked.add(d.taskId);
  }
  return blocked;
}

export async function loadActiveTasksForScoring() {
  return prisma.task.findMany({
    where: {
      status: { in: ["inbox", "todo", "in_progress"] },
    },
    select: {
      id: true,
      title: true,
      priority: true,
      dueDate: true,
      status: true,
      estimatedEffort: true,
      workContext: true,
      createdAt: true,
    },
  });
}

export async function computeNextAction(): Promise<NextActionResult> {
  const [tasks, blockedIds] = await Promise.all([
    loadActiveTasksForScoring(),
    getBlockedTaskIds(),
  ]);
  return pickNextAction(tasks, blockedIds, new Date());
}

export async function syncNextActionFlags(winnerId: string | null): Promise<void> {
  await prisma.task.updateMany({ data: { nextAction: false } });
  if (winnerId)
    await prisma.task.update({
      where: { id: winnerId },
      data: { nextAction: true },
    });
}

export async function computeAndSyncNextAction(): Promise<NextActionResult> {
  const next = await computeNextAction();
  await syncNextActionFlags(next?.taskId ?? null);
  return next;
}

export async function getOrBuildDailyPlan(
  now = new Date(),
  forceRefresh = false,
): Promise<DailyPlanResult> {
  const dateKey = localDateKey(now);
  if (!forceRefresh) {
    const existing = await prisma.dailyPlan.findUnique({
      where: { dateKey },
    });
    if (existing?.suggestedTasksJson) {
      try {
        const parsed = JSON.parse(existing.suggestedTasksJson) as DailyPlanResult;
        if (parsed.items?.length) {
          const ids = parsed.items.map((i) => i.taskId);
          const titles = await prisma.task.findMany({
            where: { id: { in: ids } },
            select: { id: true, title: true },
          });
          const map = new Map(titles.map((t) => [t.id, t.title]));
          return {
            ...parsed,
            items: parsed.items.map((i) => ({
              ...i,
              title: map.get(i.taskId) ?? i.title,
            })),
          };
        }
      } catch {
        /* fall through */
      }
    }
  }

  const [tasks, blockedIds] = await Promise.all([
    loadActiveTasksForScoring(),
    getBlockedTaskIds(),
  ]);
  const draft = buildDailyPlanDraft(tasks, blockedIds, now, dateKey);

  await prisma.dailyPlan.upsert({
    where: { dateKey },
    create: {
      dateKey,
      summary: draft.summary,
      suggestedTasksJson: JSON.stringify(draft),
    },
    update: {
      summary: draft.summary,
      suggestedTasksJson: JSON.stringify(draft),
    },
  });

  return draft;
}

export async function getFocusQueue(limit = 8): Promise<NextActionPick[]> {
  const now = new Date();
  const [tasks, blockedIds] = await Promise.all([
    loadActiveTasksForScoring(),
    getBlockedTaskIds(),
  ]);
  const candidates = tasks.filter(
    (t) =>
      t.status !== "done" &&
      t.status !== "blocked" &&
      !blockedIds.has(t.id),
  );
  const scored = candidates
    .map((t) => ({
      task: t,
      score: scoreTaskForPlanning(t, now),
    }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => ({
    taskId: x.task.id,
    title: x.task.title,
    score: x.score,
    reason: buildTaskReason(x.task, now),
  }));
}

export async function persistPlanningRun(args: {
  inputText: string;
  summary: string;
  draftsJson: string;
  status: "completed" | "failed";
}) {
  return prisma.planningRun.create({
    data: {
      inputText: args.inputText,
      parsedSummary: args.summary,
      createdTasksJson: args.draftsJson,
      status: args.status === "completed" ? "completed" : "failed",
    },
  });
}

export async function commitInboxDrafts(args: {
  rawInput: string;
  drafts: DraftTaskInput[];
  projectId: string | null;
  newProjectName: string | null;
}): Promise<{ createdTaskIds: string[] }> {
  const included = args.drafts.filter((d) => d.include && d.title.trim());
  if (included.length === 0) {
    await persistPlanningRun({
      inputText: args.rawInput,
      summary: "No tasks selected.",
      draftsJson: JSON.stringify(args.drafts),
      status: "failed",
    });
    return { createdTaskIds: [] };
  }

  let projectId = args.projectId;
  if (!projectId && args.newProjectName?.trim()) {
    const p = await prisma.project.create({
      data: {
        name: args.newProjectName.trim(),
        goal: `Captured from inbox`,
      },
    });
    projectId = p.id;
  }

  const idMap = new Map<string, string>();
  const createdTaskIds: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const d of included) {
      const due = d.dueDate
        ? new Date(`${d.dueDate}T12:00:00`)
        : undefined;
      const task = await tx.task.create({
        data: {
          title: d.title.trim(),
          description: d.description?.trim() || undefined,
          status: d.status,
          priority: d.priority,
          dueDate: due,
          estimatedEffort: d.estimatedEffort ?? undefined,
          projectId: projectId ?? undefined,
          sourceType: "parsed",
          workContext: d.workContext ?? "standard",
          nextAction: false,
        },
      });
      idMap.set(d.tempId, task.id);
      createdTaskIds.push(task.id);
    }

    for (const d of included) {
      const taskId = idMap.get(d.tempId);
      if (!taskId) continue;
      for (const preTemp of d.dependsOnTempIds) {
        const preId = idMap.get(preTemp);
        if (preId && preId !== taskId) {
          try {
            await tx.taskDependency.create({
              data: { taskId, dependsOnTaskId: preId },
            });
          } catch {
            /* unique violation etc. */
          }
        }
      }
    }

    await tx.planningRun.create({
      data: {
        inputText: args.rawInput,
        parsedSummary: `Committed ${included.length} task(s)`,
        createdTasksJson: JSON.stringify(included),
        status: "completed",
      },
    });
  });

  return { createdTaskIds };
}
