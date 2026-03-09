"use server";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db/drizzle";
import { workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";

export type HistoryStats = {
  // For Card 1
  totalWorkouts: number;
  percentChangeFromLastMonth: number; // +12 or -5 etc

  //   For Card 2
  favoriteMuscleGroup: string;
  favoritePercentage: number; // 34% of total volume

  // For Card 3
  mostActiveDay: string; // "Tuesday"
  peakHourRange: string; // "6:00 PM - 8:00 PM"
};

export interface WorkoutHistoryFilters {
  muscleGroup?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface WorkoutHistoryResult {
  logs: (typeof workoutLogs.$inferSelect)[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// To get the data for the cards on the history page.
export async function getHistoryStats(): Promise<HistoryStats> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) throw new Error("Not authenticated");
  return getCachedHistoryStats(session.user.id);
}

async function getCachedHistoryStats(userId: string): Promise<HistoryStats> {
  "use cache";
  cacheLife("minutes");
  cacheTag("workouts");
  cacheTag(`user-${userId}`);

  const logs = await db
    .select()
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId))
    .orderBy(desc(workoutLogs.loggedAt));

  if (logs.length === 0) {
    return {
      totalWorkouts: 0,
      percentChangeFromLastMonth: 0,
      favoriteMuscleGroup: "None",
      favoritePercentage: 0,
      mostActiveDay: "None",
      peakHourRange: "N/A",
    };
  }

  const now = new Date();

  // Date boundaries
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month

  //   Card 1: Total Workouts + % change
  const totalWorkouts = logs.length;
  const thisMonthCount = logs.filter(
    (l) => new Date(l.loggedAt) >= startOfThisMonth,
  ).length;
  const lastMonthCount = logs.filter((l) => {
    const d = new Date(l.loggedAt);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  }).length;

  const percentChangeFromLastMonth =
    lastMonthCount === 0
      ? thisMonthCount > 0
        ? 100
        : 0 // 100% increase only if there are workouts this month
      : Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);

  //   Card 2: Favorite Muscle Group
  // Count workouts per muscle group
  const muscleCount = new Map<string, number>();
  for (const log of logs) {
    const group = log.muscleGroup;
    muscleCount.set(group, (muscleCount.get(group) ?? 0) + 1);
  }

  // Find the group with the most workouts
  let favoriteMuscleGroup = "None";
  let maxCount = 0;
  for (const [group, count] of muscleCount.entries()) {
    if (count > maxCount) {
      maxCount = count;
      favoriteMuscleGroup = group;
    }
  }
  const favoritePercentage = Math.round((maxCount / totalWorkouts) * 100);

  //   Card 3: Most Active Day
  // Count workouts per day of week
  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayCount = new Array(7).fill(0);

  for (const log of logs) {
    const day = new Date(log.loggedAt).getDay(); // 0=Sun, 1=Mon...
    dayCount[day]++;
  }

  const mostActiveDayIndex = dayCount.indexOf(Math.max(...dayCount));
  const mostActiveDay = DAYS[mostActiveDayIndex];

  //   Peak Hour Range
  // Count workouts per 2-hour window for the most active day
  const hourBuckets = new Array(12).fill(0); // 12 buckets of 2hrs each

  for (const log of logs) {
    const date = new Date(log.loggedAt);
    if (date.getDay() === mostActiveDayIndex) {
      const hour = date.getHours();
      const bucket = Math.floor(hour / 2); // 0=12AM-2AM, ..., 9=6PM-8PM
      hourBuckets[bucket]++;
    }
  }

  const peakBucket = hourBuckets.indexOf(Math.max(...hourBuckets));
  const peakStartHour = peakBucket * 2;
  const peakEndHour = peakStartHour + 2;

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:00 ${period}`;
  };

  const peakHourRange = `${formatHour(peakStartHour)} - ${formatHour(peakEndHour)}`;

  return {
    totalWorkouts,
    percentChangeFromLastMonth,
    favoriteMuscleGroup:
      favoriteMuscleGroup.charAt(0).toUpperCase() +
      favoriteMuscleGroup.slice(1),
    favoritePercentage,
    mostActiveDay,
    peakHourRange,
  };
}

// Also export paginated logs for the history table
export async function getFilteredWorkoutHistory(
  filters: WorkoutHistoryFilters = {},
): Promise<WorkoutHistoryResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Not authenticated");

  return getCachedFilteredWorkoutHistory(session.user.id, filters);
}

async function getCachedFilteredWorkoutHistory(
  userId: string,
  filters: WorkoutHistoryFilters,
): Promise<WorkoutHistoryResult> {
  "use cache";
  cacheLife("seconds"); // shorter — user actively filters
  cacheTag("workouts");
  cacheTag(`user-${userId}`);

  const { muscleGroup, dateFrom, dateTo, page = 1, limit = 10 } = filters;

  const offset = (page - 1) * limit;

  //  Build where conditions
  const conditions = [eq(workoutLogs.userId, userId)];

  if (muscleGroup && muscleGroup !== "all") {
    conditions.push(eq(workoutLogs.muscleGroup, muscleGroup as any));
  }

  if (dateFrom) {
    // Start of the from date (midnight)
    const from = new Date(dateFrom);
    from.setHours(0, 0, 0, 0);
    conditions.push(gte(workoutLogs.loggedAt, from));
  }

  if (dateTo) {
    // End of the to date (11:59 PM)
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    conditions.push(lte(workoutLogs.loggedAt, to));
  }

  const whereClause = and(...conditions);

  //  Run both queries in parallel
  const [logs, allMatchingLogs] = await Promise.all([
    db
      .select()
      .from(workoutLogs)
      .where(whereClause)
      .orderBy(desc(workoutLogs.loggedAt))
      .limit(limit)
      .offset(offset),

    // Count total for pagination — fetch just IDs to keep it light
    db.select({ id: workoutLogs.id }).from(workoutLogs).where(whereClause),
  ]);

  const totalCount = allMatchingLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return {
    logs,
    totalCount,
    totalPages,
    currentPage: page,
  };
}
