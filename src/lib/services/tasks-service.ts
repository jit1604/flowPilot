import type {
  Prisma,
  TaskPriority,
  TaskSourceType,
  TaskStatus,
  WorkContext,
} from "@prisma/client";

import { prisma } from "@/lib/db";

export type TaskListFilters = {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  projectId?: string | "all" | "none";
  search?: string;
  parentTaskId?: string | null;
};

function buildWhere(filters: TaskListFilters): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters.priority && filters.priority !== "all") {
    where.priority = filters.priority;
  }
  if (filters.projectId === "none") {
    where.projectId = null;
  } else if (filters.projectId && filters.projectId !== "all") {
    where.projectId = filters.projectId;
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim();
    // SQLite: no case-insensitive mode; store/search normalized in a later iteration if needed
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (filters.parentTaskId !== undefined) {
    where.parentTaskId = filters.parentTaskId;
  }

  return where;
}

export async function listTasks(filters: TaskListFilters = {}) {
  const where = buildWhere(filters);

  return prisma.task.findMany({
    where,
    orderBy: [
      { status: "asc" },
      { dueDate: "asc" },
      { priority: "desc" },
      { updatedAt: "desc" },
    ],
    include: {
      project: true,
      subtasks: { select: { id: true } },
      dependencies: { include: { dependsOnTask: true } },
    },
  });
}

export async function getTask(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      subtasks: true,
      parent: true,
      dependencies: { include: { dependsOnTask: true } },
      prerequisiteFor: true,
    },
  });
}

export async function createTask(data: {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  estimatedEffort?: number | null;
  projectId?: string | null;
  parentTaskId?: string | null;
  sourceType?: TaskSourceType;
  workContext?: WorkContext;
}) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? undefined,
      status: data.status ?? "inbox",
      priority: data.priority ?? "medium",
      dueDate: data.dueDate ?? undefined,
      estimatedEffort: data.estimatedEffort ?? undefined,
      projectId: data.projectId ?? undefined,
      parentTaskId: data.parentTaskId ?? undefined,
      sourceType: data.sourceType ?? "manual",
      workContext: data.workContext ?? "standard",
    },
  });
}

export async function updateTask(id: string, data: Prisma.TaskUpdateInput) {
  return prisma.task.update({ where: { id }, data });
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
}

export async function addTaskDependency(taskId: string, dependsOnTaskId: string) {
  if (taskId === dependsOnTaskId) return null;
  return prisma.taskDependency.create({
    data: { taskId, dependsOnTaskId },
  });
}

export async function removeTaskDependency(id: string) {
  await prisma.taskDependency.delete({ where: { id } });
}
