import Link from "next/link";
import { NotebookText } from "lucide-react";

import { getReviewSnapshot } from "@/lib/services/review-service";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TaskPriorityBadge, TaskStatusBadge } from "@/components/tasks/task-badges";

function fmt(d: Date) {
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

export default async function ReviewPage() {
  const snap = await getReviewSnapshot();

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
          <NotebookText className="size-5" aria-hidden />
        </span>
        <div>
          <h1 className="fp-title text-3xl font-semibold md:text-[2.125rem]">
            Review
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Since {fmt(snap.weekStarted)}: wins, drag, and stuck work.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Completed (7d)</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {snap.completedThisWeek.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Stuck / stale</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {snap.stuck.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Open &amp; overdue</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {snap.overdueOpenCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="fp-title text-lg font-semibold md:text-xl">
          Completed lately
        </h2>
        {snap.completedThisWeek.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No completions in the last 7 days.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {snap.completedThisWeek.slice(0, 12).map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
              >
                <span className="font-medium">{t.title}</span>
                <span className="text-xs text-muted-foreground">
                  {t.project?.name ?? "—"} · done {fmt(t.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="fp-title text-lg font-semibold md:text-xl">
          Stuck or stale
        </h2>
        <p className="text-sm text-muted-foreground">
          Blocked for a week+, or in progress without updates for 7+ days.
        </p>
        {snap.stuck.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Nothing stuck by these rules.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {snap.stuck.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{t.title}</span>
                  <TaskStatusBadge status={t.status} />
                  <TaskPriorityBadge priority={t.priority} />
                </div>
                <span className="text-xs text-muted-foreground">
                  Updated {fmt(t.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="fp-title text-lg font-semibold md:text-xl">
          Long overdue (&gt;14d)
        </h2>
        {snap.longOverdue.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No tasks past due by two weeks.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {snap.longOverdue.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-1 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium">{t.title}</span>
                <span className="text-xs text-muted-foreground">
                  Due {t.dueDate ? fmt(t.dueDate) : "—"} ·{" "}
                  {t.project?.name ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex gap-3">
        <Link href="/tasks" className={buttonVariants({ variant: "secondary" })}>
          Tasks
        </Link>
        <Link href="/planner" className={buttonVariants({ variant: "outline" })}>
          Planner
        </Link>
      </div>
    </div>
  );
}
