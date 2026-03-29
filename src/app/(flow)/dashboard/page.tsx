import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Focus,
  ListTodo,
  Target,
  Zap,
} from "lucide-react";

import {
  getDashboardSummary,
  getMomentumStreak,
  getQuickWinCandidates,
} from "@/lib/services/dashboard-service";
import {
  computeNextAction,
  getOrBuildDailyPlan,
} from "@/lib/services/planning-service";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { WeeklyIntentionCard } from "@/components/dashboard/weekly-intention-card";

export default async function DashboardPage() {
  const [summary, next, dayPlan, streak, quickWins] = await Promise.all([
    getDashboardSummary(),
    computeNextAction(),
    getOrBuildDailyPlan(new Date(), false),
    getMomentumStreak(),
    getQuickWinCandidates(5),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="fp-title text-3xl font-semibold text-foreground md:text-[2.125rem]">
            Dashboard
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            FlowPilot structures capture, scores priorities locally, and keeps
            daily focus one click away—no external models required.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/focus"
            className={buttonVariants({
              size: "sm",
              className: "inline-flex gap-1.5",
            })}
          >
            <Focus className="size-4" />
            Focus
          </Link>
          <Link
            href="/inbox"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "inline-flex gap-1.5",
            })}
          >
            Inbox
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/tasks"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "inline-flex gap-1.5",
            })}
          >
            Tasks
          </Link>
        </div>
      </header>

      <WeeklyIntentionCard />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-500/20 shadow-sm shadow-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Momentum</CardTitle>
            <Zap className="size-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="fp-title text-3xl font-semibold tabular-nums">{streak}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Consecutive days with at least one completion (today can be pending).
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/15 shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick win lane</CardTitle>
            <CardDescription>
              Short tasks and “quick win” rhythms—knock one out when you have a
              sliver of time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quickWins.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add estimates ≤15 min or tag tasks as quick wins.
              </p>
            ) : (
              <ul className="space-y-2">
                {quickWins.map((t) => (
                  <li key={t.id}>
                    <Link
                      href="/tasks"
                      className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm transition hover:bg-muted/40"
                    >
                      <span className="min-w-0 truncate font-medium">{t.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        estimate{" "}
                        {t.estimatedEffort != null
                          ? `${t.estimatedEffort}m`
                          : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open tasks"
          value={summary.openCount}
          hint="Everything not marked done"
          icon={ListTodo}
        />
        <StatCard
          label="Due this week"
          value={summary.dueSoon}
          hint="Excluding completed"
          icon={Clock3}
        />
        <StatCard
          label="Overdue"
          value={summary.overdue}
          hint="Still active, past due date"
          icon={Clock3}
          accent="text-destructive"
        />
        <StatCard
          label="Done (7 days)"
          value={summary.completedThisWeek}
          hint="Completed in the last week"
          icon={CheckCircle2}
          accent="text-emerald-600 dark:text-emerald-400"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-border/80 shadow-sm lg:col-span-7">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="text-base">Today&apos;s focus</CardTitle>
              <CardDescription>
                From the daily planner engine ({dayPlan.dateKey}).{" "}
                <Link
                  href="/planner"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Open planner
                </Link>
              </CardDescription>
            </div>
            <Target className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {dayPlan.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ranked tasks yet. Add work from{" "}
                <Link href="/inbox" className="text-primary underline">
                  Inbox
                </Link>{" "}
                or clear blockers on the task list.
              </p>
            ) : (
              <ul className="space-y-2">
                {dayPlan.items.map((item, i) => (
                  <li
                    key={item.taskId}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-1 pl-8 text-xs text-muted-foreground">
                      {item.reason}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-base">Next best action</CardTitle>
            <CardDescription>
              Single highest-scoring actionable task (respects unfinished
              dependencies).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {next ? (
              <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                <p className="font-medium leading-snug">{next.title}</p>
                <p className="text-xs text-muted-foreground">{next.reason}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/15 p-6 text-center text-sm text-muted-foreground">
                Nothing eligible — check blocked tasks or celebrate an empty
                inbox.
              </div>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/focus"
                className={buttonVariants({
                  className: "flex flex-1 justify-center gap-1.5",
                })}
              >
                <Focus className="size-4" />
                Focus mode
              </Link>
              <Link
                href="/tasks"
                className={buttonVariants({
                  variant: "outline",
                  className: "flex flex-1 justify-center",
                })}
              >
                Open tasks
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="fp-title text-lg font-semibold md:text-xl">Projects</h2>
            <p className="text-sm text-muted-foreground">
              Progress from open vs total tasks.
            </p>
          </div>
          <Link
            href="/projects"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Manage
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {summary.projects.length === 0 ? (
            <Card className="border-dashed shadow-none md:col-span-2">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No projects yet. Create one to group related tasks.
              </CardContent>
            </Card>
          ) : (
            summary.projects.map((p) => {
              const total = p.tasks.length;
              const done = p.tasks.filter((t) => t.status === "done").length;
              const open = total - done;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <Card key={p.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {p.goal || p.description || "No goal set"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {open} open · {done} done
                      </span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <Separator />
                    <Link
                      href={`/projects/${p.id}`}
                      className={buttonVariants({
                        variant: "link",
                        className: "h-auto p-0",
                      })}
                    >
                      Open project
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={`size-4 text-muted-foreground ${accent ?? ""}`} />
      </CardHeader>
      <CardContent>
        <div
          className={`text-3xl font-semibold tabular-nums ${accent ?? "text-foreground"}`}
        >
          {value}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
