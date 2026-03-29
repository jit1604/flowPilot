import type { TaskPriority, TaskStatus, WorkContext } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusLabel: Record<TaskStatus, string> = {
  inbox: "Inbox",
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

const statusClass: Record<TaskStatus, string> = {
  inbox:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-200",
  todo: "border-border bg-muted text-muted-foreground",
  in_progress:
    "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100",
  blocked:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100",
  done: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
};

const priorityLabel: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const priorityClass: Record<TaskPriority, string> = {
  low: "border-transparent bg-muted text-muted-foreground",
  medium: "border-transparent bg-secondary text-secondary-foreground",
  high: "border-transparent bg-primary/15 text-primary",
  urgent:
    "border-transparent bg-destructive/15 text-destructive dark:bg-destructive/25",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold capitalize tracking-wide",
        statusClass[status],
      )}
    >
      {statusLabel[status]}
    </Badge>
  );
}

const contextClass: Record<WorkContext, string> = {
  standard: "border-border/80 bg-muted/50 text-muted-foreground",
  deep_work:
    "border-indigo-200/80 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-100",
  quick_win:
    "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
  admin:
    "border-slate-200/80 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100",
  creative:
    "border-fuchsia-200/80 bg-fuchsia-50 text-fuchsia-900 dark:border-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-100",
};

const contextLabel: Record<WorkContext, string> = {
  standard: "Standard",
  deep_work: "Deep work",
  quick_win: "Quick win",
  admin: "Admin",
  creative: "Creative",
};

export function WorkContextBadge({ context }: { context: WorkContext }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide",
        contextClass[context],
      )}
    >
      {contextLabel[context]}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold tracking-wide",
        priorityClass[priority],
      )}
    >
      {priorityLabel[priority]}
    </Badge>
  );
}
