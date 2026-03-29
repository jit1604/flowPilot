"use server";

import { revalidatePath } from "next/cache";

import { upsertWeeklyIntention } from "@/lib/services/intention-service";

export async function actionSaveWeeklyIntention(formData: FormData): Promise<void> {
  const statement = String(formData.get("statement") ?? "");
  await upsertWeeklyIntention(statement);
  revalidatePath("/dashboard");
}
