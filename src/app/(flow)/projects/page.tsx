import Link from "next/link";

import { listProjects } from "@/lib/services/projects-service";
import { CreateProjectCard } from "@/components/projects/create-project-card";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="fp-title text-3xl font-semibold text-foreground md:text-[2.125rem]">
          Projects
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Group tasks into narratives—applications, launches, research threads.
        </p>
      </header>

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <CreateProjectCard />
        <div className="rounded-xl border border-border bg-muted/15 p-6 text-sm text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground">Why projects matter</p>
          <p className="mt-2">
            FlowPilot will eventually infer project titles from messy notes and
            wire dependencies automatically. For now, create projects manually
            and assign tasks from the task editor or creation form.
          </p>
        </div>
      </div>

      <h2 className="fp-title mb-4 text-lg font-semibold md:text-xl">
        Your projects
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.length === 0 ? (
          <Card className="border-dashed md:col-span-2">
            <CardContent className="py-14 text-center text-sm text-muted-foreground">
              No projects yet. Add one with the form above.
            </CardContent>
          </Card>
        ) : (
          projects.map((p) => {
            const total = p._count.tasks;
            return (
              <Card key={p.id} className="shadow-sm transition hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {p.goal || p.description || "—"}
                      </CardDescription>
                    </div>
                    <span className="shrink-0 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[0.65rem] font-medium uppercase text-muted-foreground">
                      {p.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{total} tasks</span>
                  </div>
                  <Progress
                    value={total > 0 ? 8 : 0}
                    className="h-1.5 opacity-80"
                  />
                  <Link
                    href={`/projects/${p.id}`}
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                      className: "w-full",
                    })}
                  >
                    Open
                  </Link>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
