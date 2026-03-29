import type { Project, Task } from "@prisma/client";
import Link from "next/link";

import { isStaleSurfaceTask } from "@/lib/agent/prioritizer";
import {
  TaskPriorityBadge,
  TaskStatusBadge,
  WorkContextBadge,
} from "@/components/tasks/task-badges";
import { TaskRowMenu } from "@/components/tasks/task-row-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type TaskRow = Task & {
  project: Project | null;
  subtasks: { id: string }[];
  dependencies: { id: string; dependsOnTask: Task }[];
};

function formatDue(d: Date | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function TasksTable({
  tasks,
  projects,
}: {
  tasks: TaskRow[];
  projects: Project[];
}) {
  const now = new Date();

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No tasks match</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust filters or add a task — try{" "}
          <Link href="/inbox" className="font-medium text-primary underline">
            Inbox
          </Link>{" "}
          for batch capture.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-[0_4px_24px_-8px_rgba(36,32,74,0.12)] backdrop-blur-sm dark:bg-card/40 dark:shadow-[0_4px_28px_-8px_rgba(0,0,0,0.4)]">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[32%]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Rhythm</TableHead>
            <TableHead className="w-[72px]">Aging</TableHead>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">Deps</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const stale = isStaleSurfaceTask(
              task.createdAt,
              task.status,
              now,
            );
            return (
              <TableRow key={task.id} className="group">
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium leading-snug">{task.title}</span>
                    {task.description ? (
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {task.description}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <TaskStatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <TaskPriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDue(task.dueDate)}
                </TableCell>
                <TableCell>
                  <WorkContextBadge context={task.workContext} />
                </TableCell>
                <TableCell className="text-sm">
                  {stale ? (
                    <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-800 dark:text-amber-200">
                      Aging
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {task.project?.name ?? "—"}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {task.dependencies.length > 0
                    ? `${task.dependencies.length} upstream`
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <TaskRowMenu task={task} projects={projects} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
