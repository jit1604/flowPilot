"use client";

import type { Project, Task, TaskStatus } from "@prisma/client";
import { GitBranch, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  actionDeleteTask,
  actionGenerateSubtasks,
  actionSetTaskStatus,
} from "@/app/actions/tasks";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statuses: TaskStatus[] = [
  "inbox",
  "todo",
  "in_progress",
  "blocked",
  "done",
];

export function TaskRowMenu({
  task,
  projects,
}: {
  task: Task & {
    project: Project | null;
    subtasks: { id: string }[];
    dependencies: { id: string; dependsOnTask: Task }[];
  };
  projects: Project[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex justify-end gap-1">
      <EditTaskDialog task={task} projects={projects} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-xs" disabled={pending} />
          }
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Quick status</DropdownMenuLabel>
          {statuses.map((s) => (
            <DropdownMenuItem
              key={s}
              disabled={task.status === s || pending}
              onClick={() =>
                start(async () => {
                  await actionSetTaskStatus(task.id, s);
                  router.refresh();
                })
              }
            >
              Set {s.replace("_", " ")}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={pending}
            onClick={() =>
              start(async () => {
                await actionGenerateSubtasks(task.id);
                router.refresh();
              })
            }
          >
            <GitBranch className="size-3.5" />
            Break down (heuristic)
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await actionDeleteTask(task.id);
                router.refresh();
              })
            }
          >
            <Trash2 className="size-3.5" />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
