import { prisma } from "@/lib/db";
import { startOfLocalDay } from "@/lib/agent/date-utils";

const STALE_DAYS = 7;
const LONG_OVERDUE_DAYS = 14;

export async function getReviewSnapshot(now = new Date()) {
  const dayStart = startOfLocalDay(now);
  const weekAgo = new Date(dayStart);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const staleCut = new Date(dayStart);
  staleCut.setDate(staleCut.getDate() - STALE_DAYS);
  const longOverdueCut = new Date(dayStart);
  longOverdueCut.setDate(longOverdueCut.getDate() - LONG_OVERDUE_DAYS);

  const [
    completedThisWeek,
    stuckBlocked,
    staleInProgress,
    longOverdue,
    delayedSummary,
  ] = await Promise.all([
    prisma.task.findMany({
      where: {
        status: "done",
        updatedAt: { gte: weekAgo },
      },
      orderBy: { updatedAt: "desc" },
      take: 40,
      include: { project: { select: { name: true } } },
    }),
    prisma.task.findMany({
      where: {
        status: "blocked",
        updatedAt: { lt: staleCut },
      },
      orderBy: { updatedAt: "asc" },
      take: 30,
      include: { project: { select: { name: true } } },
    }),
    prisma.task.findMany({
      where: {
        status: "in_progress",
        updatedAt: { lt: staleCut },
      },
      orderBy: { updatedAt: "asc" },
      take: 30,
      include: { project: { select: { name: true } } },
    }),
    prisma.task.findMany({
      where: {
        NOT: { status: "done" },
        dueDate: { lt: longOverdueCut },
      },
      orderBy: { dueDate: "asc" },
      take: 25,
      include: { project: { select: { name: true } } },
    }),
    prisma.task.count({
      where: {
        NOT: { status: "done" },
        dueDate: { lt: dayStart },
      },
    }),
  ]);

  const stuck = [...stuckBlocked, ...staleInProgress].filter(
    (t, i, arr) => arr.findIndex((x) => x.id === t.id) === i,
  );

  return {
    completedThisWeek,
    stuck,
    longOverdue,
    overdueOpenCount: delayedSummary,
    weekStarted: weekAgo,
  };
}
