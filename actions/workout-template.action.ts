"use server";

import { db } from "@/db/drizzle";
import { userTemplateUsage, workoutTemplates } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { headers } from "next/headers";

export async function getWorkoutTemplates() {
  return getCachedWorkoutTemplates();
}

const getCachedWorkoutTemplates = async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("workout-templates");

  return db.select().from(workoutTemplates);
};

export async function trackTemplateUsageAction(templateId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return;

  await db
    .insert(userTemplateUsage)
    .values({
      userId: session.user.id,
      templateId,
      useCount: 1,
      lastUsedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userTemplateUsage.userId, userTemplateUsage.templateId],
      set: {
        // ✅ atomic increment — no race condition
        useCount: sql`${userTemplateUsage.useCount} + 1`,
        lastUsedAt: new Date(),
      },
    });
}

export async function getUserTemplateUsage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];
  return getCachedTemplateUsage(session.user.id);
}

async function getCachedTemplateUsage(userId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`template-usage-${userId}`);

  return db
    .select()
    .from(userTemplateUsage)
    .where(eq(userTemplateUsage.userId, userId));
}
