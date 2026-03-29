import type { Task } from "@prisma/client";

import { scoreTaskForPlanning } from "@/lib/agent/prioritizer";
import type { NextActionResult } from "@/lib/types/agent";

export type TaskScoreRow = Pick<
  Task,
  | "id"
  | "title"
  | "priority"
  | "dueDate"
  | "status"
  | "estimatedEffort"
  | "workContext"
  | "createdAt"
>;

const CONTEXT_LABEL: Record<Task["workContext"], string> = {
  standard: "Standard",
  deep_work: "Deep work block",
  quick_win: "Quick win",
  admin: "Admin / ops",
  creative: "Creative",
};

export function buildTaskReason(task: TaskScoreRow, now: Date): string {
  const reasons: string[] = [];
  if (task.dueDate) {
    const d = new Date(task.dueDate);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() < today.getTime()) reasons.push("Past-due deadline");
    else if (d.getTime() === today.getTime()) reasons.push("Due today");
    else reasons.push("Deadline coming up");
  }
  if (task.priority === "urgent" || task.priority === "high") {
    reasons.push("High priority");
  }
  if (task.workContext !== "standard") {
    reasons.push(CONTEXT_LABEL[task.workContext]);
  }
  if (task.estimatedEffort != null && task.estimatedEffort <= 15) {
    reasons.push("≤15 min estimate");
  }
  if (reasons.length === 0) {
    reasons.push("Best fit for your current rhythm and signals");
  }
  return reasons.join(" · ");
}

export function pickNextAction(
  tasks: TaskScoreRow[],
  blockedTaskIds: Set<string>,
  now: Date,
): NextActionResult {
  const candidates = tasks.filter(
    (t) =>
      t.status !== "done" &&
      t.status !== "blocked" &&
      !blockedTaskIds.has(t.id),
  );

  if (candidates.length === 0) return null;

  const scored = candidates.map((t) => ({
    task: t,
    score: scoreTaskForPlanning(t, now),
  }));

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 0) return null;

  return {
    taskId: best.task.id,
    title: best.task.title,
    score: best.score,
    reason: buildTaskReason(best.task, now),
  };
}
