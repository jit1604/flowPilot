"use server";

import { revalidatePath } from "next/cache";
import type { TaskPriority, TaskStatus, WorkContext } from "@prisma/client";

import { suggestSubtasksForTitle } from "@/lib/agent/subtask-generator";
import {
  computeAndSyncNextAction,
  getOrBuildDailyPlan,
} from "@/lib/services/planning-service";
import {
  addTaskDependency,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  removeTaskDependency,
  updateTask,
} from "@/lib/services/tasks-service";

function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  if (value == null || value === "") return null;
  const s = String(value);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseIntOpt(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

const WORK_CONTEXTS: WorkContext[] = [
  "standard",
  "deep_work",
  "quick_win",
  "admin",
  "creative",
];

function parseWorkContext(value: FormDataEntryValue | null): WorkContext {
  const s = String(value ?? "standard");
  return WORK_CONTEXTS.includes(s as WorkContext) ? (s as WorkContext) : "standard";
}

export async function getTasksForFilters(filters: {
  status?: string;
  priority?: string;
  projectId?: string;
  search?: string;
}) {
  return listTasks({
    status: (filters.status as TaskStatus) ?? "all",
    priority: (filters.priority as TaskPriority) ?? "all",
    projectId: filters.projectId ?? "all",
    search: filters.search,
    parentTaskId: null,
  });
}

export async function actionCreateTask(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await createTask({
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    status: (formData.get("status") as TaskStatus) || "inbox",
    priority: (formData.get("priority") as TaskPriority) || "medium",
    dueDate: parseOptionalDate(formData.get("dueDate")),
    estimatedEffort: parseIntOpt(formData.get("estimatedEffort")),
    projectId: String(formData.get("projectId") || "") || null,
    workContext: parseWorkContext(formData.get("workContext")),
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/planner");
  revalidatePath("/review");
  revalidatePath("/focus");
  await computeAndSyncNextAction();
}

export async function actionUpdateTask(taskId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false as const, error: "Title is required" };

  const projectIdRaw = String(formData.get("projectId") || "").trim();
  await updateTask(taskId, {
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    status: (formData.get("status") as TaskStatus) || undefined,
    priority: (formData.get("priority") as TaskPriority) || undefined,
    dueDate: parseOptionalDate(formData.get("dueDate")),
    estimatedEffort: parseIntOpt(formData.get("estimatedEffort")),
    project: projectIdRaw
      ? { connect: { id: projectIdRaw } }
      : { disconnect: true },
    workContext: parseWorkContext(formData.get("workContext")),
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/planner");
  revalidatePath("/review");
  revalidatePath("/focus");
  await computeAndSyncNextAction();
  return { ok: true as const };
}

export async function actionQuickComplete(formData: FormData): Promise<void> {
  const id = String(formData.get("taskId") ?? "").trim();
  if (!id) return;
  await updateTask(id, { status: "done" });
  await getOrBuildDailyPlan(new Date(), true);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/planner");
  revalidatePath("/review");
  revalidatePath("/focus");
  await computeAndSyncNextAction();
}

export async function actionSetTaskStatus(taskId: string, status: TaskStatus) {
  await updateTask(taskId, { status });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/planner");
  revalidatePath("/review");
  revalidatePath("/focus");
  await computeAndSyncNextAction();
}

export async function actionDeleteTask(taskId: string) {
  await deleteTask(taskId);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/planner");
  revalidatePath("/review");
  revalidatePath("/focus");
  await computeAndSyncNextAction();
}

export async function actionAddDependency(
  taskId: string,
  dependsOnTaskId: string,
) {
  try {
    await addTaskDependency(taskId, dependsOnTaskId);
  } catch {
    return { ok: false as const, error: "Could not add dependency" };
  }
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/planner");
  revalidatePath("/focus");
  await computeAndSyncNextAction();
  return { ok: true as const };
}

export async function actionRemoveDependency(dependencyId: string) {
  await removeTaskDependency(dependencyId);
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/focus");
  await computeAndSyncNextAction();
}

export async function actionGenerateSubtasks(taskId: string): Promise<void> {
  const parent = await getTask(taskId);
  if (!parent) return;

  const titles = suggestSubtasksForTitle(parent.title);
  if (titles.length === 0) return;

  for (const title of titles) {
    await createTask({
      title,
      status: "inbox",
      priority: parent.priority,
      projectId: parent.projectId,
      parentTaskId: parent.id,
      sourceType: "generated",
      workContext: parent.workContext,
    });
  }

  await computeAndSyncNextAction();
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/planner");
  revalidatePath("/projects");
  revalidatePath("/focus");
}
