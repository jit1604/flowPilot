import { prisma } from "@/lib/db";
import { getBlockedTaskIds } from "@/lib/services/planning-service";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfWeekFrom(start: Date) {
  const e = new Date(start);
  e.setDate(e.getDate() + 7);
  return e;
}

/** Consecutive days (including today if not yet broken) with ≥1 completion. */
export async function getMomentumStreak(now = new Date()): Promise<number> {
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const day = startOfDay(now);
    day.setDate(day.getDate() - i);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    const n = await prisma.task.count({
      where: {
        status: "done",
        updatedAt: { gte: day, lte: end },
      },
    });
    if (n > 0) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export async function getQuickWinCandidates(limit = 5) {
  const blocked = await getBlockedTaskIds();
  const rows = await prisma.task.findMany({
    where: {
      status: { in: ["inbox", "todo", "in_progress"] },
      OR: [
        { estimatedEffort: { lte: 15 } },
        { workContext: "quick_win" },
      ],
    },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    take: 40,
    include: { project: { select: { name: true } } },
  });
  return rows.filter((t) => !blocked.has(t.id)).slice(0, limit);
}

export async function getDashboardSummary() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const weekAgo = new Date(dayStart);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEnd = endOfWeekFrom(dayStart);

  const [
    openCount,
    completedThisWeek,
    overdue,
    dueSoon,
    recentTasks,
    projects,
  ] = await Promise.all([
    prisma.task.count({ where: { NOT: { status: "done" } } }),
    prisma.task.count({
      where: {
        status: "done",
        updatedAt: { gte: weekAgo },
      },
    }),
    prisma.task.count({
      where: {
        NOT: { status: "done" },
        dueDate: { lt: dayStart },
      },
    }),
    prisma.task.count({
      where: {
        NOT: { status: "done" },
        dueDate: { gte: dayStart, lte: weekEnd },
      },
    }),
    prisma.task.findMany({
      where: { NOT: { status: "done" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { project: true },
    }),
    prisma.project.findMany({
      where: { status: "active" },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: {
        tasks: { select: { id: true, status: true } },
      },
    }),
  ]);

  return {
    openCount,
    completedThisWeek,
    overdue,
    dueSoon,
    recentTasks,
    projects,
  };
}
