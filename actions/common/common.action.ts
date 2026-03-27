"use server";
import { db } from "@/db/drizzle";
import { savedWorkouts, workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ActionResult } from "@/types";
import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

// delete is the mutation action, so here no need for use cache.
export const deleteWorkoutAction = async (workoutId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Not authenticated");

  try {
    const [log] = await db
      .select()
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.id, workoutId),
          eq(workoutLogs.userId, session.user.id),
        ),
      )
      .limit(1);

    if (!log) throw new Error("Workout not found.");

    await db
      .delete(workoutLogs)
      .where(
        and(
          eq(workoutLogs.id, workoutId),
          eq(workoutLogs.userId, session.user.id),
        ),
      );

    await db
      .delete(savedWorkouts)
      .where(
        and(
          eq(savedWorkouts.userId, session.user.id),
          eq(savedWorkouts.name, log.exerciseName),
          eq(savedWorkouts.muscleGroup, log.muscleGroup),
        ),
      );

    revalidateTag(`workouts-${session.user.id}`, "max");
    revalidateTag(`saved-workouts-${session.user.id}`, "max");
    revalidatePath("/dashboard");
    revalidatePath("/history");
    revalidatePath("/saved-workout");

    return { success: true, message: "Workout deleted successfully!" };
  } catch (error) {
    console.error("[deleteWorkoutAction] DB error:", error);
    return {
      success: false,
      message: "Failed to delete workout. Please try again.",
    };
  }
};

// unknown -  to never trust the client types
export const saveWorkoutFromLogAction = async (
  logId: string,
): Promise<ActionResult> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id)
    return { success: false, message: "Not authenticated" };

  // Fetching the original log
  const [log] = await db
    .select()
    .from(workoutLogs)
    .where(
      and(eq(workoutLogs.id, logId), eq(workoutLogs.userId, session.user.id)),
    )
    .limit(1);

  if (!log) return { success: false, message: "Log not found" };

  // Check for the duplicate
  const [existing] = await db
    .select({ id: savedWorkouts.id })
    .from(savedWorkouts)
    .where(
      and(
        eq(savedWorkouts.userId, session.user.id),
        eq(savedWorkouts.name, log.exerciseName),
        eq(savedWorkouts.muscleGroup, log.muscleGroup),
      ),
    )
    .limit(1);

  if (existing) {
    return { success: false, message: "Already saved to your templates!" };
  }

  try {
    const [inserted] = await db
      .insert(savedWorkouts)
      .values({
        userId: session.user.id,
        name: log.exerciseName,
        description: log.notes ?? null,
        muscleGroup: log.muscleGroup,
        difficulty: log.difficulty,
        sets: log.sets ?? null,
        reps: log.reps ?? null,
        weightKg: log.weightKg ?? null,
        durationMin: log.durationMin ?? null,
        distanceKm: log.distanceKm ?? null,
        caloriesBurned: log.caloriesBurned ?? null,
      })
      .returning({ savedId: savedWorkouts.id }); // return the new row's id

    revalidateTag(`saved-workouts-${session.user.id}`, "max");
    return {
      success: true,
      message: `${log.exerciseName} saved! 🔖`,
      savedId: inserted.savedId,
    };
  } catch (error) {
    console.error("[saveWorkoutFromLogAction] DB error:", error);
    return {
      success: false,
      message: "Failed to save workout. Please try again.",
    };
  }
};

export const unsaveWorkoutLogAction = async (
  savedId: string,
): Promise<ActionResult> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id)
    return { success: false, message: "Not authenticated" };

  try {
    await db
      .delete(savedWorkouts)
      .where(
        and(
          eq(savedWorkouts.id, savedId),
          eq(savedWorkouts.userId, session.user.id),
        ),
      );
  } catch (error) {
    return { success: false, message: "Failed to unsave workout." };
  }

  revalidateTag(`saved-workouts-${session.user.id}`, "max");
  return { success: true, message: "Unsaved successfully!" };
};

export async function getSavedWorkouts() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];
  return db
    .select()
    .from(savedWorkouts)
    .where(eq(savedWorkouts.userId, session.user.id));
}
