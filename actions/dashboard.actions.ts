"use server";

import { db } from "@/db/drizzle";
import { goals, workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

// Auth Helper
export async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

// Get Recent Workout Logs (for table + algorithms)
// export async function getRecentWorkoutLogs(limit = 50) {
//   const userId = await getUserId();

//   return db
//     .select()
//     .from(workoutLogs)
//     .where(eq(workoutLogs.userId, userId))
//     .limit(limit)
//     .orderBy(desc(workoutLogs.loggedAt));
// }

// // Get Logs for Chart (last 30 days)
// export async function getMonthlyWorkoutLogs() {
//   const userId = await getUserId();

//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//   const logs = await db
//     .select()
//     .from(workoutLogs)
//     .where(eq(workoutLogs.userId, userId))
//     .orderBy(desc(workoutLogs.loggedAt));

//   // Filter last 30 days in JS (simpler than drizzle and() for now)
//   return logs.filter((log) => new Date(log.loggedAt) >= thirtyDaysAgo);
// }

// // Get User Goal
// export async function getUserGoal() {
//   const userId = await getUserId();

//   const result = await db
//     .select()
//     .from(goals)
//     .where(eq(goals.userId, userId))
//     .limit(1);

//   return result[0] ?? null;
// }

// Get All Dashboard Data in One Call
// This is the main function your dashboard page.tsx calls.
// One round-trip instead of 3 separate fetches.
export async function getDashboardData() {
  const userId = await getUserId();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Run both DB queries in parallel — faster than awaiting sequentially
  const [allLogs, goal] = await Promise.all([
    db
      .select()
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.loggedAt))
      .limit(100),

    db.select().from(goals).where(eq(goals.userId, userId)).limit(1),
  ]);

  const monthlyLogs = allLogs.filter(
    (log) => new Date(log.loggedAt) >= thirtyDaysAgo,
  );

  return {
    recentLogs: allLogs.slice(0, 10), // last 10 for the table
    allLogs, // all 100 for algorithms
    monthlyLogs, // last 30 days for chart
    goal: goal[0] ?? null,
  };
}
