"use server";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db/drizzle";
import { goals, workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type GoalActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

//   Get user's current goal
export async function getUserGoal() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Not authenticated");

  return getCachedUserGoal(session.user.id);
}

async function getCachedUserGoal(userId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("goals");

  const result = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

// upsert goal (create or update), mutation of data so, no use cache here
export async function upsertGoal(
  targetDaysPerWeek: number,
): Promise<GoalActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" };
  }

  if (targetDaysPerWeek < 1 || targetDaysPerWeek > 7) {
    return { success: false, message: "Goal must be between 1 and 7 days" };
  }

  try {
    const existing = await getUserGoal();

    if (existing) {
      await db
        .update(goals)
        .set({ targetValue: targetDaysPerWeek, updatedAt: new Date() })
        .where(eq(goals.userId, session.user.id));
    } else {
      await db.insert(goals).values({
        userId: session.user.id,
        goalType: "weekly_workouts",
        targetValue: targetDaysPerWeek,
      });
    }
  } catch (error) {
    console.error("[upsertGoal] DB error:", error);
    return {
      success: false,
      message: "Failed to update goal. Please try again.",
    };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return { success: true, message: "Goal updated successfully!" };
}

// Get this week's progress data
export interface WeekProgressData {
  targetDays: number;
  doneDays: number;
  // Array of 7 days Sun→Sat with workout status
  weekDays: {
    label: string; // "MON", "TUE" etc
    date: Date;
    isToday: boolean;
    hasWorkout: boolean;
    isFuture: boolean;
  }[];
  sessionsNeeded: number; // how many more to hit goal
}

export async function getWeekProgress(): Promise<WeekProgressData> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Not authenticated");

  return getCachedWeekProgress(session.user.id);
}

async function getCachedWeekProgress(
  userId: string,
): Promise<WeekProgressData> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`workouts-${userId}`);
  cacheTag("goals");

  // Don't call auth/headers() inside a cache scope; use the provided userId.
  const goalResult = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .limit(1);
  const goal = goalResult[0] ?? null;
  const targetDays = goal?.targetValue ?? 3;

  //  Get start of current week (Monday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  // Shift so week starts on Monday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);

  //   Fetch all logs from this week
  const logs = await db
    .select({ loggedAt: workoutLogs.loggedAt })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId));

  // Filter to this week in JS
  const thisWeekLogs = logs.filter((l) => new Date(l.loggedAt) >= monday);

  // Build Set of date strings that have workouts
  const workedOutDates = new Set(
    thisWeekLogs.map((l) => new Date(l.loggedAt).toISOString().split("T")[0]),
  );

  // Build 7-day array Mon → Sun
  const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const weekDays = DAY_LABELS.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const dateStr = date.toISOString().split("T")[0];
    const isToday = dateStr === today.toISOString().split("T")[0];
    const isFuture = date > today;

    return {
      label,
      date,
      isToday,
      hasWorkout: workedOutDates.has(dateStr),
      isFuture,
    };
  });

  const doneDays = weekDays.filter((d) => d.hasWorkout).length;
  const sessionsNeeded = Math.max(0, targetDays - doneDays);

  return {
    targetDays,
    doneDays,
    weekDays,
    sessionsNeeded,
  };
}

// Get streak data
export async function getStreakData() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Not authenticated");

  return getCachedStreakData(session.user.id);
}

async function getCachedStreakData(userId: string) {
  "use cache";
  cacheLife("hours"); // streak only changes once per day
  cacheTag(`workouts-${userId}`);

  const logs = await db
    .select({ loggedAt: workoutLogs.loggedAt })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId));

  const workoutDates = new Set(
    logs.map((l) => new Date(l.loggedAt).toISOString().split("T")[0]),
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() - i);
    const dateStr = check.toISOString().split("T")[0];

    if (workoutDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return { streak };
}
