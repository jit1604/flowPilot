import type { Prisma, ProjectStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { tasks: true } },
    },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }],
        include: {
          project: true,
          subtasks: true,
          dependencies: { include: { dependsOnTask: true } },
        },
      },
    },
  });
}

export async function createProject(data: {
  name: string;
  description?: string | null;
  goal?: string | null;
  status?: ProjectStatus;
}) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description ?? undefined,
      goal: data.goal ?? undefined,
      status: data.status ?? "active",
    },
  });
}

export async function updateProject(
  id: string,
  data: Prisma.ProjectUpdateInput,
) {
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
}
