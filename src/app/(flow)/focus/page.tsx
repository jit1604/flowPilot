import Link from "next/link";
import { Focus as FocusIcon } from "lucide-react";

import { getFocusQueue } from "@/lib/services/planning-service";
import { FocusSession } from "@/components/focus/focus-session";
import { buttonVariants } from "@/components/ui/button-variants";

export default async function FocusPage() {
  const queue = await getFocusQueue(12);
  const sessionKey = queue.map((q) => q.taskId).join("|") || "empty";

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner">
            <FocusIcon className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="fp-title text-3xl font-semibold md:text-[2.125rem]">
              Focus
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              One task on screen—minimal chrome, maximum flow. Queue ranks by
              the same intelligence as your daily planner, including work rhythm
              and stale-inbox boosts.
            </p>
          </div>
        </div>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Dashboard
        </Link>
      </header>

      <FocusSession key={sessionKey} queue={queue} />
    </div>
  );
}
