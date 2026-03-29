import type { Task, TaskPriority, WorkContext } from "@prisma/client";

import { startOfLocalDay } from "@/lib/agent/date-utils";

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  urgent: 100,
  high: 70,
  medium: 40,
  low: 15,
};

export function priorityWeight(p: TaskPriority): number {
  return PRIORITY_WEIGHT[p];
}

function staleInboxBoost(
  createdAt: Date,
  status: Task["status"],
  now: Date,
): number {
  if (status !== "inbox" && status !== "todo") return 0;
  const days =
    (startOfLocalDay(now).getTime() - startOfLocalDay(new Date(createdAt)).getTime()) /
    86400000;
  if (days > 21) return 22;
  if (days > 14) return 14;
  if (days > 7) return 8;
  return 0;
}

/** Surfaces tasks that fit the current hour — FlowPilot “rhythm” without ML. */
function workContextTimeBonus(context: WorkContext, hour: number): number {
  switch (context) {
    case "quick_win":
      if (hour < 11) return 14;
      if (hour >= 17) return 12;
      return 7;
    case "deep_work":
      if (hour >= 9 && hour < 12) return 14;
      if (hour >= 13 && hour < 17) return 16;
      return 5;
    case "admin":
      if (hour < 13) return 10;
      if (hour >= 17) return 11;
      return 7;
    case "creative":
      if (hour >= 10 && hour < 14) return 12;
      return 7;
    default:
      return 0;
  }
}

export type TaskScoreSlice = Pick<
  Task,
  | "priority"
  | "dueDate"
  | "status"
  | "estimatedEffort"
  | "workContext"
  | "createdAt"
>;

/** Higher = more important / urgent to work on next. */
export function scoreTaskForPlanning(task: TaskScoreSlice, now: Date): number {
  if (task.status === "done" || task.status === "blocked") return -1e6;

  let score = priorityWeight(task.priority);
  score += staleInboxBoost(task.createdAt, task.status, now);
  score += workContextTimeBonus(task.workContext, now.getHours());

  if (task.dueDate) {
    const due = startOfLocalDay(new Date(task.dueDate));
    const today = startOfLocalDay(now);
    const diffDays = Math.round(
      (due.getTime() - today.getTime()) / (86400 * 1000),
    );
    if (diffDays < 0) score += 80 + Math.min(40, Math.abs(diffDays) * 3);
    else if (diffDays === 0) score += 60;
    else if (diffDays <= 3) score += 45;
    else if (diffDays <= 7) score += 25;
  }

  if (task.estimatedEffort != null) {
    if (task.estimatedEffort <= 15) score += 8;
    else if (task.estimatedEffort <= 30) score += 5;
    else if (task.estimatedEffort >= 180) score -= 5;
  }

  if (task.workContext === "quick_win" && task.estimatedEffort != null && task.estimatedEffort <= 15) {
    score += 4;
  }

  return score;
}

/** Days since creation (local day boundaries); for UI “stale” badges. */
export function taskAgeInDays(createdAt: Date, now: Date): number {
  return Math.floor(
    (startOfLocalDay(now).getTime() - startOfLocalDay(new Date(createdAt)).getTime()) /
      86400000,
  );
}

export function isStaleSurfaceTask(
  createdAt: Date,
  status: Task["status"],
  now: Date,
): boolean {
  if (status === "done" || status === "blocked") return false;
  return taskAgeInDays(createdAt, now) >= 10;
}
