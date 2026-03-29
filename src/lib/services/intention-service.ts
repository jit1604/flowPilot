import { isoWeekKeyLocal } from "@/lib/agent/week-utils";
import { prisma } from "@/lib/db";

export function currentWeekKey(now = new Date()): string {
  return isoWeekKeyLocal(now);
}

export async function getWeeklyIntentionForWeek(weekKey: string) {
  return prisma.weeklyIntention.findUnique({ where: { weekKey } });
}

export async function upsertWeeklyIntention(statement: string, now = new Date()) {
  const weekKey = currentWeekKey(now);
  const trimmed = statement.trim();
  if (!trimmed) {
    await prisma.weeklyIntention.deleteMany({ where: { weekKey } });
    return null;
  }
  return prisma.weeklyIntention.upsert({
    where: { weekKey },
    create: { weekKey, statement: trimmed },
    update: { statement: trimmed },
  });
}
