"use client";

import type { Project, TaskPriority, WorkContext } from "@prisma/client";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { actionCommitInbox, actionParseInbox } from "@/app/actions/planning";
import type { DraftTaskInput } from "@/lib/types/agent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function emptyDrafts(): DraftTaskInput[] {
  return [];
}

export function InboxCapture({ projects }: { projects: Project[] }) {
  const [raw, setRaw] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftTaskInput[]>(emptyDrafts);
  const [projectMode, setProjectMode] = useState<"none" | "existing" | "new">(
    "none",
  );
  const [projectId, setProjectId] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pendingParse, startParse] = useTransition();
  const [pendingCommit, startCommit] = useTransition();

  const titleByTemp = useMemo(() => {
    const m = new Map<string, string>();
    drafts.forEach((d) => m.set(d.tempId, d.title));
    return m;
  }, [drafts]);

  function onParse() {
    setMessage(null);
    startParse(async () => {
      const res = await actionParseInbox(raw);
      if (!res.ok) {
        setMessage(res.error);
        setDrafts(emptyDrafts());
        setSummary(null);
        return;
      }
      setSummary(res.result.summary);
      setDrafts(res.result.drafts);
      if (res.result.inferredProjectName) {
        setNewProjectName(res.result.inferredProjectName);
        setProjectMode("new");
      }
    });
  }

  function updateDraft(tempId: string, patch: Partial<DraftTaskInput>) {
    setDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, ...patch } : d)),
    );
  }

  function onCommit() {
    setMessage(null);
    startCommit(async () => {
      const res = await actionCommitInbox({
        rawInput: raw,
        drafts,
        projectId: projectMode === "existing" ? projectId || null : null,
        newProjectName:
          projectMode === "new" ? newProjectName.trim() || null : null,
      });
      if (res.createdCount === 0) {
        setMessage("Nothing to save — enable at least one task with a title.");
        return;
      }
      setMessage(`Saved ${res.createdCount} task(s).`);
      setDrafts(emptyDrafts());
      setSummary(null);
      setRaw("");
    });
  }

  const includedCount = drafts.filter((d) => d.include).length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div>
          <h1 className="fp-title text-3xl font-semibold md:text-[2.125rem]">
            Inbox capture
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Paste notes, lists, or rambling goals. FlowPilot extracts tasks,
            due hints, and priority signals—then you edit before commit.
          </p>
        </div>
      </header>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Messy input</CardTitle>
          <CardDescription>
            Works offline; parsing is heuristic, not an external model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={`Example:\nNOC Application:\nI need to apply for NOC, update my resume, draft a pitch deck, and email my professor by Friday.`}
            rows={8}
            className="min-h-[180px] resize-y bg-background text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onParse}
              disabled={pendingParse || !raw.trim()}
            >
              {pendingParse ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              Parse capture
            </Button>
          </div>
        </CardContent>
      </Card>

      {summary ? (
        <p className="text-sm font-medium text-muted-foreground">{summary}</p>
      ) : null}

      {drafts.length > 0 ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Preview &amp; edit</CardTitle>
            <CardDescription>
              Toggle rows off to skip. Tweak titles before saving to SQLite.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground">
                  Project
                </Label>
                <select
                  className={cn(selectClass)}
                  value={projectMode}
                  onChange={(e) =>
                    setProjectMode(e.target.value as typeof projectMode)
                  }
                >
                  <option value="none">None</option>
                  <option value="existing">Existing project</option>
                  <option value="new">Create new project</option>
                </select>
              </div>
              {projectMode === "existing" ? (
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">
                    Link to
                  </Label>
                  <select
                    className={cn(selectClass)}
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              {projectMode === "new" ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs uppercase text-muted-foreground">
                    New project name
                  </Label>
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Internship applications"
                    className="bg-background"
                  />
                </div>
              ) : null}
            </div>

            <ul className="space-y-3">
              {drafts.map((d) => (
                <li
                  key={d.tempId}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <input
                      type="checkbox"
                      checked={d.include}
                      onChange={(e) =>
                        updateDraft(d.tempId, { include: e.target.checked })
                      }
                      className="mt-2 size-4 rounded border-input"
                    />
                    <div className="min-w-0 flex-1 space-y-3">
                      <Input
                        value={d.title}
                        onChange={(e) =>
                          updateDraft(d.tempId, { title: e.target.value })
                        }
                        className="bg-background font-medium"
                      />
                      {d.dependsOnTempIds.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Depends on:{" "}
                          {d.dependsOnTempIds
                            .map((id) => titleByTemp.get(id) ?? id.slice(0, 6))
                            .join(", ")}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-3">
                        <div className="grid gap-1">
                          <span className="text-[0.65rem] font-medium uppercase text-muted-foreground">
                            Priority
                          </span>
                          <select
                            className={cn(selectClass, "w-36")}
                            value={d.priority}
                            onChange={(e) =>
                              updateDraft(d.tempId, {
                                priority: e.target.value as TaskPriority,
                              })
                            }
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div className="grid gap-1">
                          <span className="text-[0.65rem] font-medium uppercase text-muted-foreground">
                            Due
                          </span>
                          <Input
                            type="date"
                            value={d.dueDate ?? ""}
                            onChange={(e) =>
                              updateDraft(d.tempId, {
                                dueDate: e.target.value || null,
                              })
                            }
                            className="w-40 bg-background"
                          />
                        </div>
                        <div className="grid gap-1">
                          <span className="text-[0.65rem] font-medium uppercase text-muted-foreground">
                            Status
                          </span>
                          <select
                            className={cn(selectClass, "w-40")}
                            value={d.status}
                            onChange={(e) =>
                              updateDraft(d.tempId, {
                                status: e.target.value as DraftTaskInput["status"],
                              })
                            }
                          >
                            <option value="inbox">Inbox</option>
                            <option value="todo">To do</option>
                            <option value="in_progress">In progress</option>
                          </select>
                        </div>
                        <div className="grid gap-1">
                          <span className="text-[0.65rem] font-medium uppercase text-muted-foreground">
                            Rhythm
                          </span>
                          <select
                            className={cn(selectClass, "min-w-[11rem]")}
                            value={d.workContext ?? "standard"}
                            onChange={(e) =>
                              updateDraft(d.tempId, {
                                workContext: e.target.value as WorkContext,
                              })
                            }
                          >
                            <option value="standard">Standard</option>
                            <option value="quick_win">Quick win</option>
                            <option value="deep_work">Deep work</option>
                            <option value="admin">Admin</option>
                            <option value="creative">Creative</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={onCommit}
                disabled={pendingCommit || includedCount === 0}
              >
                {pendingCommit ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Save {includedCount} task(s)
              </Button>
              <span className="text-xs text-muted-foreground">
                Creates a planning run record for traceability.
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {message ? (
        <p className="text-sm text-foreground/80" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
