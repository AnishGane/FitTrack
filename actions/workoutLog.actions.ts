"use server";

import { db } from "@/db/drizzle";
import { workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { WorkoutLogSchema } from "@/validation/validation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

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

  // Revalidate
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/workout");

  return { success: true, message: "Workout logged successfully! 💪" };
};
