/**
 * Deterministic subtask expansion for vague / large tasks — no LLM.
 */
export function suggestSubtasksForTitle(title: string): string[] {
  const t = title.trim().toLowerCase();
  if (t.length < 4) return [];

  const rules: { re: RegExp; subs: string[] }[] = [
    {
      re: /pitch|deck|slides|presentation/,
      subs: [
        "Outline narrative and slide list",
        "Draft slide content and visuals",
        "Review and rehearse timing",
      ],
    },
    {
      re: /resume|cv/,
      subs: [
        "List recent wins and metrics",
        "Update skills and education",
        "Proofread and export PDF",
      ],
    },
    {
      re: /internship|job|application|apply/,
      subs: [
        "Shortlist target roles",
        "Tailor resume and cover template",
        "Submit applications and track deadlines",
      ],
    },
    {
      re: /landing|website|site|page/,
      subs: [
        "Final copy and structure",
        "Implement layout and responsive tweaks",
        "Analytics, forms, and deploy",
      ],
    },
    {
      re: /launch|ship|release/,
      subs: [
        "Define launch checklist",
        "Dry run and rollback plan",
        "Announce and monitor feedback",
      ],
    },
    {
      re: /noc|permit|license|filing/,
      subs: [
        "Gather required documents",
        "Complete application form",
        "Submit and track status",
      ],
    },
    {
      re: /email|reach out|message|professor/,
      subs: [
        "Draft message with clear ask",
        "Proofread subject line",
        "Send and note follow-up date",
      ],
    },
  ];

  for (const { re, subs } of rules) {
    if (re.test(t)) return subs;
  }

  if (/\bplan\b|\bstrategy\b|\bprep\b|\bprepare\b/.test(t)) {
    return [
      "Break outcome into milestones",
      "List unknowns and blockers",
      "Schedule first concrete step",
    ];
  }

  return [];
}
