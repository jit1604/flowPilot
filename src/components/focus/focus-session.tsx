"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { actionQuickComplete } from "@/app/actions/tasks";
import type { NextActionPick } from "@/lib/types/agent";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

export function FocusSession({ queue }: { queue: NextActionPick[] }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [pending, start] = useTransition();

  if (queue.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 py-20 text-center backdrop-blur-md">
        <Sparkles className="mb-4 size-12 text-primary/60" />
        <h2 className="fp-title text-2xl font-semibold">Clear runway</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Nothing scored for focus right now—capture work or clear blockers on
          upstream tasks.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/inbox" className={buttonVariants({ size: "sm" })}>
            Inbox capture
          </Link>
          <Link
            href="/tasks"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Task list
          </Link>
        </div>
      </div>
    );
  }

  const at = idx % queue.length;
  const current = queue[at]!;

  function skip() {
    setIdx((i) => i + 1);
  }

  function markDone() {
    start(async () => {
      const fd = new FormData();
      fd.set("taskId", current.taskId);
      await actionQuickComplete(fd);
      setIdx(0);
      router.refresh();
    });
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      <div
        className="pointer-events-none absolute -inset-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-fuchsia-500/10 blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-8 shadow-2xl backdrop-blur-xl md:p-12 dark:bg-card/70">
        <div className="mb-6 flex items-center justify-between gap-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Flow mode
          </span>
          <span className="text-xs text-muted-foreground">
            {at + 1} / {queue.length} in queue
          </span>
        </div>
        <h2 className="fp-title text-2xl font-semibold leading-snug md:text-3xl">
          {current.title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {current.reason}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            size="lg"
            className="min-w-[140px]"
            disabled={pending}
            onClick={markDone}
          >
            {pending ? "Saving…" : "Mark done"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={pending || queue.length < 2}
            onClick={skip}
          >
            Skip for now
            <ChevronRight className="size-4" />
          </Button>
          <Link
            href="/tasks"
            className={buttonVariants({
              variant: "ghost",
              size: "lg",
              className: "text-muted-foreground",
            })}
          >
            Exit focus
          </Link>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          Queue is built from the same planner as your dashboard—priority, dates,
          dependencies, work rhythm, and aging inbox signals.
        </p>
      </div>
    </div>
  );
}
