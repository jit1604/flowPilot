import type { TaskPriority, TaskStatus } from "@prisma/client";

import { listProjects } from "@/lib/services/projects-service";
import { listTasks } from "@/lib/services/tasks-service";
import { CreateTaskPanel } from "@/components/tasks/create-task-panel";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TasksTable } from "@/components/tasks/tasks-table";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TasksPage(props: PageProps) {
  const sp = await props.searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const status =
    typeof sp.status === "string" ? sp.status : undefined;
  const priority =
    typeof sp.priority === "string" ? sp.priority : undefined;
  const projectId =
    typeof sp.projectId === "string" ? sp.projectId : undefined;

  const [projects, tasks] = await Promise.all([
    listProjects(),
    listTasks({
      status: (status as TaskStatus) ?? "all",
      priority: (priority as TaskPriority) ?? "all",
      projectId: projectId ?? "all",
      search,
      parentTaskId: null,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="fp-title text-3xl font-semibold text-foreground md:text-[2.125rem]">
          Tasks
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Filter, edit, and track work. Use Inbox to parse messy notes into
          tasks before they land here.
        </p>
      </header>

      <CreateTaskPanel projects={projects} />

      <TaskFilters
        projects={projects}
        current={{ search, status, priority, projectId }}
      />

      <TasksTable tasks={tasks} projects={projects} />
    </div>
  );
}
