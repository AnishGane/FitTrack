"use server";
import { db } from "@/db/drizzle";
import { workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";

// delete is the mutation action, so here no need for use cache.
export const deleteWorkoutAction = async (workoutId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Not authenticated");

  try {
    await db
      .delete(workoutLogs)
      .where(
        and(
          eq(workoutLogs.id, workoutId),
          eq(workoutLogs.userId, session.user.id),
        ),
      );

    // Immediate invalidation after mutation to avoid stale reads on next fetch.
    updateTag(`workouts-${session.user.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/history");

    return { success: true, message: "Workout deleted successfully!" };
  } catch (error) {
    console.error("[deleteWorkoutAction] DB error:", error);
    return {
      success: false,
      message: "Failed to delete workout. Please try again.",
    };
  }
};
