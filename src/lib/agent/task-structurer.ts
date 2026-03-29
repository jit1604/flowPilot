import type { TaskPriority, WorkContext } from "@prisma/client";

import { segmentRawInput, inferProjectNameFromCapture } from "@/lib/agent/input-parser";
import type { DraftTaskInput, ParsedCaptureResult } from "@/lib/types/agent";

export function inferWorkContextFromTitle(title: string): WorkContext {
  const t = title.toLowerCase();
  if (
    /\b(email|invoice|receipt|call|schedule|book|upload|file|tax|form|sign|pay|renew)\b/.test(
      t,
    )
  )
    return "admin";
  if (/\b(quick|5 ?min|2 ?min|reply|ping|nudge|remind)\b/.test(t))
    return "quick_win";
  if (
    /\b(design|draft|write|sketch|draw|prototype|wireframe|storyboard)\b/.test(
      t,
    )
  )
    return "creative";
  if (
    /\b(research|implement|build|deep|focus block|architecture)\b/.test(t)
  )
    return "deep_work";
  return "standard";
}

function hintToPriority(hint: ReturnType<typeof segmentRawInput>[0]["priorityHint"]): TaskPriority {
  if (hint === "urgent") return "urgent";
  if (hint === "high") return "high";
  if (hint === "low") return "low";
  return "medium";
}

/** Order-based heuristics: “after resume” / “then email” → dependency on previous actionable item. */
function attachSequentialDeps(drafts: DraftTaskInput[]): void {
  const actionable = drafts.filter((d) => d.include);
  for (let i = 1; i < actionable.length; i++) {
    const prev = actionable[i - 1];
    const cur = actionable[i];
    const blob = `${prev.title} ${cur.title}`.toLowerCase();
    if (
      /\b(after|once|then|before)\b/.test(blob) ||
      /\bfirst\b.*\bthen\b/.test(blob)
    ) {
      if (!cur.dependsOnTempIds.includes(prev.tempId))
        cur.dependsOnTempIds.push(prev.tempId);
    }
  }
}

export function structureCaptureFromText(raw: string, now = new Date()): ParsedCaptureResult {
  const segments = segmentRawInput(raw, now);
  const inferredProjectName = inferProjectNameFromCapture(raw);

  const drafts: DraftTaskInput[] = segments.map((seg) => {
    const tempId = crypto.randomUUID();
    return {
      tempId,
      title: seg.title,
      description: seg.raw !== seg.title ? seg.raw : null,
      priority: hintToPriority(seg.priorityHint),
      dueDate: seg.dueDate ? seg.dueDate.toISOString().slice(0, 10) : null,
      status: "inbox" as const,
      estimatedEffort: null,
      workContext: inferWorkContextFromTitle(seg.title),
      dependsOnTempIds: [],
      include: true,
    };
  });

  attachSequentialDeps(drafts);

  const summary =
    segments.length === 0
      ? "No actionable lines detected."
      : `Extracted ${segments.length} candidate task(s).`;

  return {
    summary,
    inferredProjectName,
    drafts,
  };
}
