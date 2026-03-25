"use server";

import { db } from "@/db/drizzle";
import { workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { WorkoutLogSchema } from "@/validation/validation";
import { and, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache";
import { headers } from "next/headers";

export async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function getMonthlyWorkoutLogs() {
  const userId = await getUserId();
  return getCachedMonthlyWorkoutLogs(userId);
}

async function getCachedMonthlyWorkoutLogs(userId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`workouts-${userId}`);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logs = await db
    .select()
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId))
    .orderBy(desc(workoutLogs.loggedAt));

  const monthlyLogs = logs.filter(
    (log) => new Date(log.loggedAt) >= thirtyDaysAgo,
  );

  return { monthlyLogs };
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

// mutation of data so, no use cache here also
export const logWorkoutAction = async (
  rawValues: unknown,
): Promise<ActionResult> => {
  // Validate on server
  const parsed = WorkoutLogSchema.safeParse(rawValues);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid form data";
    return { success: false, message: firstError };
  }

  // Authenticate
  let userId: string;
  try {
    userId = await getUserId();
  } catch (error) {
    console.error("[logWorkoutAction] Auth error:", error);
    return { success: false, message: "Not authenticated" };
  }
  const data = parsed.data;

  // Insert
  try {
    await db.insert(workoutLogs).values({
      userId: userId,
      exerciseName: data.exerciseName,
      muscleGroup: data.muscleGroup,
      difficulty: data.difficulty,
      sets: data.sets,
      reps: data.reps,
      weightKg: data.weightKg,
      durationMin: data.durationMin,
      distanceKm: data.distanceKm,
      caloriesBurned: data.caloriesBurned,
      notes: data.notes,
      isPersonalBest: data.isPersonalBest,
    });
  } catch (error) {
    console.error("[logWorkoutAction] DB error:", error);
    return {
      success: false,
      message: "Failed to save workout. Please try again.",
    };
  }

  // revalidateTag replaces all three revalidatePath calls
  // Busts: dashboard + history + goals + streak — everything tagged "workouts"
  updateTag(`workouts-${userId}`);
  revalidateTag(`workouts-${userId}`, "max");

  return { success: true, message: "Workout logged successfully! 💪" };
};

export const updateWorkoutAction = async (
  id: string,
  rawValues: unknown,
): Promise<ActionResult> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id)
    return { success: false, message: "Not authenticated" };

  const parsed = WorkoutLogSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid data",
    };
  }

  try {
    await db
      .update(workoutLogs)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(workoutLogs.id, id),
          eq(workoutLogs.userId, session.user.id), // security
        ),
      );
  } catch (error) {
    return { success: false, message: "Failed to update workout." };
  }

  revalidateTag(`workouts-${session.user.id}`, "max");
  return { success: true, message: "Workout updated successfully! ✏️" };
};
