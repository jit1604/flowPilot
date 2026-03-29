import Link from "next/link";
import { notFound } from "next/navigation";

import { getProject, listProjects } from "@/lib/services/projects-service";
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from "@/components/tasks/task-badges";
import { TasksTable } from "@/components/tasks/tasks-table";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage(props: PageProps) {
  const { id } = await props.params;
  const [project, allProjects] = await Promise.all([
    getProject(id),
    listProjects(),
  ]);

  if (!project) notFound();

  const rootTasks = project.tasks.filter((t) => !t.parentTaskId);
  const total = project.tasks.length;
  const done = project.tasks.filter((t) => t.status === "done").length;
  const blocked = project.tasks.filter((t) => t.status === "blocked").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/projects"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            ← Projects
          </Link>
          <h1 className="fp-title mt-2 text-3xl font-semibold md:text-[2.125rem]">
            {project.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {project.goal || project.description || "No goal or description yet."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/tasks"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            All tasks
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Progress</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{pct}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={pct} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {done} done · {total - done} remaining
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{blocked}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Waiting on dependencies or decisions
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total scope</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Includes nested subtasks shown below
            </p>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="fp-title mb-4 text-lg font-semibold md:text-xl">
          Top-level tasks
        </h2>
        <TasksTable tasks={rootTasks} projects={allProjects} />
      </section>

      {project.tasks.some((t) => t.parentTaskId) ? (
        <>
          <Separator className="my-8" />
          <section>
            <h2 className="fp-title mb-4 text-lg font-semibold md:text-xl">
              Subtasks &amp; nested work
            </h2>
            <div className="space-y-2">
              {project.tasks
                .filter((t) => t.parentTaskId)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
                  >
                    <span className="font-medium">{t.title}</span>
                    <TaskStatusBadge status={t.status} />
                    <TaskPriorityBadge priority={t.priority} />
                  </div>
                ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
