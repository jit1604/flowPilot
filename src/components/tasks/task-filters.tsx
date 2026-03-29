import type { Project } from "@prisma/client";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

type Filters = {
  status?: string;
  priority?: string;
  projectId?: string;
  search?: string;
};

export function TaskFilters({
  projects,
  current,
}: {
  projects: Project[];
  current: Filters;
}) {
  return (
    <form
      className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
      action="/tasks"
      method="get"
    >
      <div className="grid flex-1 gap-3 sm:min-w-[200px]">
        <Label htmlFor="search" className="text-xs font-medium uppercase">
          Search
        </Label>
        <Input
          id="search"
          name="search"
          placeholder="Title or description…"
          defaultValue={current.search ?? ""}
          className="bg-background"
        />
      </div>
      <div className="grid gap-2 sm:w-44">
        <Label htmlFor="status" className="text-xs font-medium uppercase">
          Status
        </Label>
        <select
          id="status"
          name="status"
          defaultValue={current.status ?? "all"}
          className={cn(selectClass)}
        >
          <option value="all">All</option>
          <option value="inbox">Inbox</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="blocked">Blocked</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div className="grid gap-2 sm:w-44">
        <Label htmlFor="priority" className="text-xs font-medium uppercase">
          Priority
        </Label>
        <select
          id="priority"
          name="priority"
          defaultValue={current.priority ?? "all"}
          className={cn(selectClass)}
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <div className="grid flex-1 gap-2 sm:min-w-[200px]">
        <Label htmlFor="projectId" className="text-xs font-medium uppercase">
          Project
        </Label>
        <select
          id="projectId"
          name="projectId"
          defaultValue={current.projectId ?? "all"}
          className={cn(selectClass)}
        >
          <option value="all">All</option>
          <option value="none">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className={buttonVariants({ size: "sm" })}
        >
          Apply
        </button>
        <Link
          href="/tasks"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
