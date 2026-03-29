import type { TaskPriority, TaskStatus, WorkContext } from "@prisma/client";

/** Serializable draft before DB commit (includes client edits). */
export type DraftTaskInput = {
  tempId: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  status: TaskStatus;
  estimatedEffort?: number | null;
  workContext?: WorkContext;
  dependsOnTempIds: string[];
  include: boolean;
};

export type ParsedCaptureResult = {
  summary: string;
  inferredProjectName: string | null;
  drafts: DraftTaskInput[];
};

export type DailyPlanItem = {
  taskId: string;
  title: string;
  reason: string;
  score: number;
};

export type DailyPlanResult = {
  dateKey: string;
  summary: string;
  items: DailyPlanItem[];
};

export type NextActionPick = {
  taskId: string;
  title: string;
  reason: string;
  score: number;
};

export type NextActionResult = NextActionPick | null;
