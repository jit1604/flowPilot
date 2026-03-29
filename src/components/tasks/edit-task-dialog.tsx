"use client";

import type { Project, Task } from "@prisma/client";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { actionUpdateTask } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkContextSelect } from "@/components/tasks/work-context-select";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function formatDateForInput(d: Date | null) {
  if (!d) return "";
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EditTaskDialog({
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
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            type="button"
            className="text-muted-foreground"
          />
        }
      >
        <Pencil className="size-4" />
        <span className="sr-only">Edit task</span>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Changes save to your local database immediately.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          action={async (rawFormData) => {
            const result = await actionUpdateTask(task.id, rawFormData);
            if (result.ok) {
              setOpen(false);
              router.refresh();
            }
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor={`title-${task.id}`}>Title</Label>
            <Input
              id={`title-${task.id}`}
              name="title"
              defaultValue={task.title}
              required
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`description-${task.id}`}>Description</Label>
            <Textarea
              id={`description-${task.id}`}
              name="description"
              defaultValue={task.description ?? ""}
              rows={3}
              className="bg-background"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`status-${task.id}`}>Status</Label>
              <select
                id={`status-${task.id}`}
                name="status"
                defaultValue={task.status}
                className={cn(selectClass)}
              >
                <option value="inbox">Inbox</option>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`priority-${task.id}`}>Priority</Label>
              <select
                id={`priority-${task.id}`}
                name="priority"
                defaultValue={task.priority}
                className={cn(selectClass)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`dueDate-${task.id}`}>Due date</Label>
              <Input
                id={`dueDate-${task.id}`}
                name="dueDate"
                type="date"
                defaultValue={formatDateForInput(task.dueDate)}
                className="bg-background"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`effort-${task.id}`}>Estimate (minutes)</Label>
              <Input
                id={`effort-${task.id}`}
                name="estimatedEffort"
                type="number"
                min={0}
                defaultValue={task.estimatedEffort ?? ""}
                className="bg-background"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`workContext-${task.id}`}>Work rhythm</Label>
            <WorkContextSelect
              id={`workContext-${task.id}`}
              defaultValue={task.workContext}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`project-${task.id}`}>Project</Label>
            <select
              id={`project-${task.id}`}
              name="projectId"
              defaultValue={task.projectId ?? ""}
              className={cn(selectClass)}
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
