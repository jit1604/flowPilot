/** ISO week key in local timezone, e.g. 2026-W13 */
export function isoWeekKeyLocal(time: Date): string {
  const date = new Date(time.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const isoYear = date.getFullYear();
  const week1 = new Date(isoYear, 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${isoYear}-W${String(weekNum).padStart(2, "0")}`;
}
