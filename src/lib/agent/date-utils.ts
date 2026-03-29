/** Local calendar day key for DailyPlan / scoring. */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Next occurrence of weekday (0=Sun..6=Sat) on or after local calendar day of `from`. */
export function nextWeekday(from: Date, targetWeekday: number): Date {
  const base = startOfLocalDay(from);
  const cur = base.getDay();
  const delta = (targetWeekday - cur + 7) % 7;
  return startOfLocalDay(addDays(base, delta));
}

const DAY_NAMES: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

export function extractDueDateFromText(text: string, now: Date): Date | null {
  const lower = text.toLowerCase();

  if (/\btoday\b/.test(lower)) return startOfLocalDay(now);
  if (/\btomorrow\b|\btmrw\b/.test(lower))
    return startOfLocalDay(addDays(now, 1));

  if (/\bnext week\b/.test(lower))
    return startOfLocalDay(addDays(now, 7));

  if (/\bend of (this )?week\b|\beow\b|\bby eod\b/.test(lower))
    return startOfLocalDay(addDays(now, 5 - now.getDay() || 7));

  for (const [name, wd] of Object.entries(DAY_NAMES)) {
    const re = new RegExp(`\\b(${name})\\b`, "i");
    if (re.test(lower)) {
      return nextWeekday(now, wd);
    }
  }

  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const d = new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
    );
    return startOfLocalDay(d);
  }

  return null;
}
