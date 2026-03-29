import { extractDueDateFromText } from "@/lib/agent/date-utils";

export type ParsedSegment = {
  raw: string;
  title: string;
  dueDate: Date | null;
  priorityHint: "low" | "medium" | "high" | "urgent" | null;
};

const ACTION_VERBS =
  /^(need to|must|should|have to|remember to|don't forget to|pls|please)\s+/i;

function cleanTitle(s: string): string {
  let t = s.replace(/^[\s•\-\*]+/g, "").replace(/^\d+\.\s*/, "").trim();
  t = t.replace(ACTION_VERBS, "");
  t = t.replace(/\s+/g, " ");
  if (t.length > 200) t = `${t.slice(0, 197)}…`;
  return t.replace(/^[,;]+|[,;]+$/g, "").trim();
}

function inferPriorityFromText(text: string): ParsedSegment["priorityHint"] {
  const lower = text.toLowerCase();
  if (/\burgent\b|\basap\b|\bimmediately\b|\bcritical\b/.test(lower))
    return "urgent";
  if (
    /\bimportant\b|\bhigh priority\b|\bdeadline\b/.test(lower) ||
    /\bby (monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow)\b/.test(
      lower,
    ) ||
    /\bthis week\b|\beod\b|\beow\b/.test(lower)
  )
    return "high";
  if (/\bwhenever\b|\bnice to have\b|\bsometime\b|\blow priority\b/.test(lower))
    return "low";
  return null;
}

function inferProjectLine(firstLine: string): string | null {
  const t = firstLine.trim();
  if (/^[^:]+:$/.test(t) && t.length < 80)
    return t.replace(/:$/, "").trim();
  const m = t.match(/^(goal|project|for)\s*[:\-]?\s*(.+)$/i);
  if (m && m[2].length < 80) return m[2].trim();
  return null;
}

function splitLineIntoPhrases(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  let chunk = trimmed.replace(/^[-•*]+\s*/, "");

  const byDelimiter = chunk.split(/\s+(?:[-•*]|\d+\.)\s+/);
  if (byDelimiter.length > 1)
    return byDelimiter.map((s) => s.trim()).filter((s) => s.length > 1);

  const commaChunks = chunk.split(/[,;]\s+/).map((s) => s.trim());
  if (commaChunks.length > 1) {
    const verbLike = (c: string) =>
      /\b(apply|update|draft|email|send|call|finish|write|prepare|submit|review|schedule|book|buy|fix|build|ship|get|file)\b/i.test(
        c,
      );
    if (commaChunks.filter(verbLike).length >= 2) return commaChunks;
  }

  return [chunk];
}

/** Split messy capture into segments (lines, bullets, clause splits). */
export function segmentRawInput(raw: string, now: Date): ParsedSegment[] {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let bodyLines = lines;
  if (lines.length > 1) {
    const maybeHeader = inferProjectLine(lines[0]);
    if (maybeHeader && lines[0].length < 100 && !lines[0].includes(","))
      bodyLines = lines.slice(1);
  }

  const globalDue = extractDueDateFromText(normalized, now);
  const globalPri = inferPriorityFromText(normalized);

  const segments: ParsedSegment[] = [];

  const pushSegment = (rawText: string) => {
    const title = cleanTitle(rawText);
    if (title.length < 2) return;
    const localDue = extractDueDateFromText(rawText, now);
    const localPri = inferPriorityFromText(rawText);
    segments.push({
      raw: rawText,
      title,
      dueDate: localDue ?? globalDue,
      priorityHint: localPri ?? globalPri,
    });
  };

  for (const line of bodyLines) {
    for (const phrase of splitLineIntoPhrases(line)) pushSegment(phrase);
  }

  if (segments.length === 0 && lines.length >= 1) {
    for (const phrase of splitLineIntoPhrases(lines.join(" "))) pushSegment(phrase);
  }

  return segments;
}

export function inferProjectNameFromCapture(raw: string): string | null {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  const first = inferProjectLine(lines[0]);
  if (first) return first;
  const goal = raw.match(/(?:launch|prepare|ship)\s+([^.\n]{3,60})/i);
  if (goal?.[1]) return goal[1].trim();
  return null;
}
