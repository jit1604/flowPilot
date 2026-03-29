import type { Project } from "@prisma/client";
import Link from "next/link";

import { actionCreateTask } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkContextSelect } from "@/components/tasks/work-context-select";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function CreateTaskPanel({ projects }: { projects: Project[] }) {
  return (
    <Card className="mb-8 border-dashed shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">New task</CardTitle>
        <p className="text-sm text-muted-foreground">
          Or use{" "}
          <Link href="/inbox" className="text-primary underline">
            Inbox
          </Link>{" "}
          for messy notes—parser extracts tasks before save.
        </p>
      </CardHeader>
      <CardContent>
        <form action={actionCreateTask} className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="What needs doing?"
              required
              className="bg-background"
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional context, links, or notes…"
              rows={3}
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" className={cn(selectClass)}>
              <option value="inbox">Inbox</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <select id="priority" name="priority" className={cn(selectClass)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estimatedEffort">
              Estimate (minutes)
            </Label>
            <Input
              id="estimatedEffort"
              name="estimatedEffort"
              type="number"
              min={0}
              placeholder="e.g. 45"
              className="bg-background"
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="workContext">Work rhythm</Label>
            <p className="text-xs text-muted-foreground">
              Tells the planner when this task fits your day—morning quick wins,
              deep blocks, etc.
            </p>
            <WorkContextSelect id="workContext" />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="projectId">Project</Label>
            <select id="projectId" name="projectId" className={cn(selectClass)}>
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Add task</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
