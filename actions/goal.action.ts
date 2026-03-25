"use server";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db/drizzle";
import { goals, workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

import {
  addCalendarDaysToDateKey,
  getDateKeyInTimeZone,
  isValidIanaTimeZone,
  weekdayIndexMondayFirst,
} from "@/lib/calendar-timezone";

export type GoalActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

async function resolveRequestTimeZone(): Promise<string> {
  const h = await headers();
  const vercelTz = h.get("x-vercel-ip-timezone");
  if (vercelTz && isValidIanaTimeZone(vercelTz)) {
    return vercelTz;
  }
  const c = await cookies();
  const raw = c.get("fittrack-tz")?.value;
  if (raw) {
    const tz = decodeURIComponent(raw);
    if (isValidIanaTimeZone(tz)) {
      return tz;
    }
  }
  return "UTC";
}

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

  const timeZone = await resolveRequestTimeZone();
  return getCachedWeekProgress(session.user.id, timeZone);
}

async function getCachedWeekProgress(
  userId: string,
  timeZone: string,
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

  const logs = await db
    .select({ loggedAt: workoutLogs.loggedAt })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId));

  const now = new Date();
  const todayKey = getDateKeyInTimeZone(now, timeZone);
  const mondayOffset = weekdayIndexMondayFirst(now, timeZone);
  const mondayKey = addCalendarDaysToDateKey(todayKey, -mondayOffset);
  const weekDayKeys = Array.from({ length: 7 }, (_, i) =>
    addCalendarDaysToDateKey(mondayKey, i),
  );
  const sundayKey = weekDayKeys[6]!;

  const workedOutDates = new Set<string>();
  for (const l of logs) {
    const key = getDateKeyInTimeZone(new Date(l.loggedAt), timeZone);
    if (key >= mondayKey && key <= sundayKey) {
      workedOutDates.add(key);
    }
  }

  // Build 7-day array Mon → Sun
  const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const weekDays = DAY_LABELS.map((label, i) => {
    const dateStr = weekDayKeys[i]!;
    const isToday = dateStr === todayKey;
    const isFuture = dateStr > todayKey;

    return {
      label,
      date: new Date(`${dateStr}T12:00:00.000Z`),
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

  const timeZone = await resolveRequestTimeZone();
  return getCachedStreakData(session.user.id, timeZone);
}

async function getCachedStreakData(userId: string, timeZone: string) {
  "use cache";
  cacheLife("hours"); // streak only changes once per day
  cacheTag(`workouts-${userId}`);

  const logs = await db
    .select({ loggedAt: workoutLogs.loggedAt })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId));

  const workoutDates = new Set(
    logs.map((l) => getDateKeyInTimeZone(new Date(l.loggedAt), timeZone)),
  );

  let streak = 0;
  let key = getDateKeyInTimeZone(new Date(), timeZone);

  for (let i = 0; i < 365; i++) {
    if (workoutDates.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    key = addCalendarDaysToDateKey(key, -1);
  }

  return { streak };
}
