import type {
  Project,
  Task,
  TaskDependency,
  TaskPriority,
  TaskSourceType,
  TaskStatus,
} from "@prisma/client";

export type {
  Project,
  Task,
  TaskDependency,
  TaskPriority,
  TaskSourceType,
  TaskStatus,
};

export type TaskWithRelations = Task & {
  project: Project | null;
  subtasks: Task[];
  dependencies: (TaskDependency & { dependsOnTask: Task })[];
};
