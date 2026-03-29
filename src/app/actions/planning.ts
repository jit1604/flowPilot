"use server";

import { revalidatePath } from "next/cache";

import { addDays, startOfLocalDay } from "@/lib/agent/date-utils";
import type { DraftTaskInput } from "@/lib/types/agent";
import {
  commitInboxDrafts,
  computeAndSyncNextAction,
  getOrBuildDailyPlan,
  parseCaptureText,
} from "@/lib/services/planning-service";
import { getTask, updateTask } from "@/lib/services/tasks-service";

export async function actionParseInbox(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      ok: false as const,
      error: "Add some text to parse.",
    };
  }
  const result = parseCaptureText(trimmed);
  return { ok: true as const, result };
}

export async function actionCommitInbox(args: {
  rawInput: string;
  drafts: DraftTaskInput[];
  projectId: string | null;
  newProjectName: string | null;
}) {
  const { createdTaskIds } = await commitInboxDrafts({
    rawInput: args.rawInput,
    drafts: args.drafts,
    projectId: args.projectId,
    newProjectName: args.newProjectName,
  });

  await computeAndSyncNextAction();
  await getOrBuildDailyPlan(new Date(), true);

  revalidatePath("/inbox");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/planner");
  revalidatePath("/review");
  revalidatePath("/projects");
  revalidatePath("/focus");

  return { ok: true as const, createdCount: createdTaskIds.length };
}

export async function actionRefreshDailyPlan() {
  await getOrBuildDailyPlan(new Date(), true);
  await computeAndSyncNextAction();
  revalidatePath("/planner");
  revalidatePath("/dashboard");
  revalidatePath("/focus");
}

export async function actionDeferTask(formData: FormData): Promise<void> {
  const id = String(formData.get("taskId") ?? "").trim();
  if (!id) return;
  const t = await getTask(id);
  if (!t) return;
  const base = t.dueDate ? startOfLocalDay(new Date(t.dueDate)) : startOfLocalDay(new Date());
  const next = addDays(base, 1);
  await updateTask(id, { dueDate: next });
  await getOrBuildDailyPlan(new Date(), true);
  await computeAndSyncNextAction();
  revalidatePath("/planner");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath("/review");
  revalidatePath("/focus");
}
