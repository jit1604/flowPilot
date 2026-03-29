import { buildTaskReason } from "@/lib/agent/next-action";
import type { TaskScoreRow } from "@/lib/agent/next-action";
import { scoreTaskForPlanning } from "@/lib/agent/prioritizer";
import type { DailyPlanItem, DailyPlanResult } from "@/lib/types/agent";

function reasonForRank(task: TaskScoreRow, rank: number, now: Date): string {
  const detail = buildTaskReason(task, now);
  const rankLabel =
    rank === 0 ? "Top pick" : rank === 1 ? "Strong second" : "Solid third";
  return `${rankLabel} · ${detail}`;
}

export function buildDailyPlanDraft(
  tasks: TaskScoreRow[],
  blockedTaskIds: Set<string>,
  now: Date,
  dateKey: string,
): DailyPlanResult {
  const candidates = tasks.filter(
    (t) =>
      t.status !== "done" &&
      t.status !== "blocked" &&
      !blockedTaskIds.has(t.id),
  );

  const scored = candidates
    .map((t) => ({
      task: t,
      score: scoreTaskForPlanning(t, now),
    }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3);
  const items: DailyPlanItem[] = top.map((x, i) => ({
    taskId: x.task.id,
    title: x.task.title,
    score: x.score,
    reason: reasonForRank(x.task, i, now),
  }));

  const summary =
    items.length === 0
      ? "No eligible tasks — everything is done, blocked, or waiting on dependencies."
      : `Recommended focus: ${items[0]?.title ?? ""}${items.length > 1 ? " and related work." : "."}`;

  return { dateKey, summary, items };
}
