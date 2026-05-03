"use server";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db/drizzle";
import { workoutLogs, goals } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  ExerciseProgress,
  FitnessStats,
  HeatmapDay,
  MuscleGroupVolume,
  PersonalBest,
  WeeklyVolumePoint,
} from "@/types";

// Main exported function
export async function getFitnessStats(): Promise<FitnessStats> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Not authenticated");
  return getCachedFitnessStats(session.user.id);
}

// Cached computation
async function getCachedFitnessStats(userId: string): Promise<FitnessStats> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`workouts-${userId}`);
  cacheTag("goals");

  const [logs, goalResult] = await Promise.all([
    db
      .select()
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.loggedAt)),
    db.select().from(goals).where(eq(goals.userId, userId)).limit(1),
  ]);

  const goal = goalResult[0] ?? null;
  const goalTarget = goal?.targetValue ?? 3;

  if (logs.length === 0) {
    return emptyStats(goalTarget);
  }

  // Summary KPIs
  const totalWorkouts = logs.length;
  const totalSets = logs.reduce((s, l) => s + (l.sets ?? 0), 0);
  const totalReps = logs.reduce((s, l) => s + (l.reps ?? 0), 0);
  const totalDurationMin = logs.reduce((s, l) => s + (l.durationMin ?? 0), 0);
  const totalCaloriesBurned = logs.reduce(
    (s, l) => s + (l.caloriesBurned ?? 0),
    0,
  );
  const totalDistanceKm = logs.reduce((s, l) => s + (l.distanceKm ?? 0), 0);

  // Streak
  const { currentStreak, longestStreak } = computeStreaks(logs);

  // Personal Bests
  const personalBests = computePersonalBests(logs);

  // Muscle Group Volumes
  const muscleGroupVolumes = computeMuscleGroupVolumes(logs, totalWorkouts);

  // Weekly Volume (last 12 weeks)
  const weeklyVolume = computeWeeklyVolume(logs);

  // Heatmap (last 365 days)
  const heatmap = computeHeatmap(logs);

  // Top Exercise Progress
  const topExerciseProgress = computeExerciseProgress(logs);

  return {
    totalWorkouts,
    totalSets,
    totalReps,
    totalDurationMin,
    totalCaloriesBurned,
    totalDistanceKm,
    longestStreak,
    currentStreak,
    personalBests,
    muscleGroupVolumes,
    weeklyVolume,
    heatmap,
    topExerciseProgress,
    goalTarget,
  };
}

// Helper function
function computeStreaks(logs: (typeof workoutLogs.$inferSelect)[]) {
  const dates = new Set(
    logs.map((l) => new Date(l.loggedAt).toISOString().split("T")[0]),
  );
  const sorted = Array.from(dates).sort();

  let longest = 0;
  let current = 0;
  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]!);
    const curr = new Date(sorted[i]!);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }
  longest = Math.max(longest, streak);

  // Current streak from today backwards
  const today = new Date().toISOString().split("T")[0]!;
  let c = 0;
  let checkDate = today;
  while (dates.has(checkDate)) {
    c++;
    const d = new Date(checkDate);
    d.setDate(d.getDate() - 1);
    checkDate = d.toISOString().split("T")[0]!;
  }
  current = c;

  return { currentStreak: current, longestStreak: Math.max(longest, 1) };
}

function computePersonalBests(
  logs: (typeof workoutLogs.$inferSelect)[],
): PersonalBest[] {
  // Per exercise: track max weight, max reps, max duration, max distance
  const bests = new Map<string, PersonalBest>();

  for (const log of logs) {
    const key = `${log.exerciseName}__${log.muscleGroup}`;
    const existing = bests.get(key);

    if (!existing) {
      bests.set(key, {
        exerciseName: log.exerciseName,
        muscleGroup: log.muscleGroup,
        bestWeightKg: log.weightKg ?? null,
        bestReps: log.reps ?? null,
        bestDurationMin: log.durationMin ?? null,
        bestDistanceKm: log.distanceKm ?? null,
        achievedAt: new Date(log.loggedAt),
      });
    } else {
      if ((log.weightKg ?? 0) > (existing.bestWeightKg ?? 0)) {
        existing.bestWeightKg = log.weightKg ?? null;
        existing.achievedAt = new Date(log.loggedAt);
      }
      if ((log.reps ?? 0) > (existing.bestReps ?? 0)) {
        existing.bestReps = log.reps ?? null;
      }
      if ((log.durationMin ?? 0) > (existing.bestDurationMin ?? 0)) {
        existing.bestDurationMin = log.durationMin ?? null;
      }
      if ((log.distanceKm ?? 0) > (existing.bestDistanceKm ?? 0)) {
        existing.bestDistanceKm = log.distanceKm ?? null;
      }
    }
  }

  // Return top 6 by best weight (fallback to duration)
  return Array.from(bests.values())
    .sort(
      (a, b) =>
        (b.bestWeightKg ?? b.bestDurationMin ?? 0) -
        (a.bestWeightKg ?? a.bestDurationMin ?? 0),
    )
    .slice(0, 6);
}

function computeMuscleGroupVolumes(
  logs: (typeof workoutLogs.$inferSelect)[],
  totalWorkouts: number,
): MuscleGroupVolume[] {
  const map = new Map<string, MuscleGroupVolume>();

  for (const log of logs) {
    const g = log.muscleGroup;
    const existing = map.get(g) ?? {
      muscleGroup: g,
      totalSets: 0,
      totalReps: 0,
      totalDurationMin: 0,
      workoutCount: 0,
      percentage: 0,
    };
    existing.totalSets += log.sets ?? 0;
    existing.totalReps += log.reps ?? 0;
    existing.totalDurationMin += log.durationMin ?? 0;
    existing.workoutCount += 1;
    map.set(g, existing);
  }

  return Array.from(map.values())
    .map((v) => ({
      ...v,
      percentage: Math.round((v.workoutCount / totalWorkouts) * 100),
    }))
    .sort((a, b) => b.workoutCount - a.workoutCount);
}

function computeWeeklyVolume(
  logs: (typeof workoutLogs.$inferSelect)[],
): WeeklyVolumePoint[] {
  const weeks: WeeklyVolumePoint[] = [];
  const now = new Date();

  for (let w = 11; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - w * 7); // Sunday of that week
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekLogs = logs.filter((l) => {
      const d = new Date(l.loggedAt);
      return d >= weekStart && d < weekEnd;
    });

    weeks.push({
      weekLabel: `W${12 - w}`,
      weekStart: weekStart.toISOString().split("T")[0]!,
      totalSets: weekLogs.reduce((s, l) => s + (l.sets ?? 0), 0),
      totalReps: weekLogs.reduce((s, l) => s + (l.reps ?? 0), 0),
      totalDurationMin: weekLogs.reduce((s, l) => s + (l.durationMin ?? 0), 0),
      workoutCount: weekLogs.length,
    });
  }

  return weeks;
}

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function computeHeatmap(
  logs: (typeof workoutLogs.$inferSelect)[],
): HeatmapDay[] {
  const countMap = new Map<string, number>();
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);

  for (const log of logs) {
    const d = new Date(log.loggedAt);
    if (d < cutoff) continue;
    const key = formatDateKey(d);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  // Fill every day in the last 365 days
  const result: HeatmapDay[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    const count = countMap.get(key) ?? 0;
    const intensity =
      count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;
    result.push({
      date: key,
      count,
      intensity: intensity as 0 | 1 | 2 | 3 | 4,
    });
  }

  return result;
}

function computeExerciseProgress(
  logs: (typeof workoutLogs.$inferSelect)[],
): ExerciseProgress[] {
  // Find top 5 most-trained exercises
  const countMap = new Map<string, number>();
  for (const log of logs) {
    const key = `${log.exerciseName}__${log.muscleGroup}`;
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  const top5 = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);

  return top5.map((key) => {
    const [exerciseName, muscleGroup] = key.split("__") as [string, string];
    const exerciseLogs = logs
      .filter(
        (l) => l.exerciseName === exerciseName && l.muscleGroup === muscleGroup,
      )
      .sort(
        (a, b) =>
          new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
      )
      .slice(-10); // last 10 entries

    return {
      exerciseName,
      muscleGroup,
      dataPoints: exerciseLogs.map((l) => ({
        date: new Date(l.loggedAt).toISOString().split("T")[0]!,
        weightKg: l.weightKg ?? null,
        reps: l.reps ?? null,
        durationMin: l.durationMin ?? null,
        distanceKm: l.distanceKm ?? null,
      })),
    };
  });
}

function emptyStats(goalTarget: number): FitnessStats {
  return {
    totalWorkouts: 0,
    totalSets: 0,
    totalReps: 0,
    totalDurationMin: 0,
    totalCaloriesBurned: 0,
    totalDistanceKm: 0,
    longestStreak: 0,
    currentStreak: 0,
    personalBests: [],
    muscleGroupVolumes: [],
    weeklyVolume: [],
    heatmap: [],
    topExerciseProgress: [],
    goalTarget,
  };
}
