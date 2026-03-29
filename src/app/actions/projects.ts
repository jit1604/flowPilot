"use server";

import { revalidatePath } from "next/cache";
import type { ProjectStatus } from "@prisma/client";

import {
  createProject,
  deleteProject,
  updateProject,
} from "@/lib/services/projects-service";

export async function actionCreateProject(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await createProject({
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    goal: String(formData.get("goal") ?? "").trim() || null,
    status: (formData.get("status") as ProjectStatus) || "active",
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function actionUpdateProject(
  projectId: string,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false as const, error: "Name is required" };

  await updateProject(projectId, {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    goal: String(formData.get("goal") ?? "").trim() || null,
    status: (formData.get("status") as ProjectStatus) || undefined,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  return { ok: true as const };
}

export async function actionDeleteProject(projectId: string) {
  await deleteProject(projectId);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
}
