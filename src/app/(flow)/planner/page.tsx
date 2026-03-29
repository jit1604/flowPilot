import Link from "next/link";
import { CalendarDays, RefreshCw } from "lucide-react";

import { actionDeferTask, actionRefreshDailyPlan } from "@/app/actions/planning";
import { actionQuickComplete } from "@/app/actions/tasks";
import { getOrBuildDailyPlan } from "@/lib/services/planning-service";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PlannerPage() {
  const plan = await getOrBuildDailyPlan(new Date(), false);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            <CalendarDays className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="fp-title text-3xl font-semibold md:text-[2.125rem]">
              Daily planner
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Top picks from urgency, deadlines, priority, dependencies, and
              effort—deterministic scoring, no API keys.
            </p>
          </div>
        </div>
        <form action={actionRefreshDailyPlan}>
          <Button type="submit" variant="outline" size="sm">
            <RefreshCw className="size-4" />
            Regenerate
          </Button>
        </form>
      </header>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Today — {plan.dateKey}</CardTitle>
          <CardDescription>{plan.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              No eligible tasks. Complete something or add work from{" "}
              <Link href="/inbox" className="text-primary underline">
                Inbox
              </Link>
              .
            </p>
          ) : (
            <ol className="space-y-3">
              {plan.items.map((item, i) => (
                <li
                  key={item.taskId}
                  className="flex gap-3 rounded-2xl border border-border/70 bg-card/50 px-4 py-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-card/30"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.reason}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <form action={actionQuickComplete}>
                        <input type="hidden" name="taskId" value={item.taskId} />
                        <button
                          type="submit"
                          className={buttonVariants({
                            variant: "secondary",
                            size: "xs",
                          })}
                        >
                          Mark done
                        </button>
                      </form>
                      <Link
                        href="/tasks"
                        className={buttonVariants({
                          variant: "link",
                          className: "h-auto px-0 text-xs",
                        })}
                      >
                        Update in task list
                      </Link>
                      <form action={actionDeferTask}>
                        <input type="hidden" name="taskId" value={item.taskId} />
                        <button
                          type="submit"
                          className={buttonVariants({
                            variant: "ghost",
                            size: "xs",
                            className: "text-muted-foreground",
                          })}
                        >
                          Defer +1 day
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
