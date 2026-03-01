import { WorkoutLog } from "@/db/schema";

// Streak & Consistency Algorithm
export interface StreakResult {
  currentStreak: number;
  consistencyScore: number; // 0–100
  totalWorkoutsThisWeek: number;
  targetDaysPerWeek: number;
}

/**
 * STREAK & CONSISTENCY SCORING ALGORITHM
 *
 * Streak:      Walk backwards day by day from today.
 *              Increment streak for each day that has a workout.
 *              Stop on first gap (skip today if no workout yet).
 *
 * Consistency: (unique days worked out this week / target days) * 100
 *              Capped at 100.
 *
 * Time Complexity:  O(n log n) — sort + O(365) walk = effectively O(n)
 * Space Complexity: O(n) — date Set
 */
export function calculateStreakAndScore(
  logs: WorkoutLog[],
  targetDaysPerWeek: number,
): StreakResult {
  if (logs.length === 0) {
    return {
      currentStreak: 0,
      consistencyScore: 0,
      totalWorkoutsThisWeek: 0,
      targetDaysPerWeek,
    };
  }

  // Build Set of unique workout date strings
  const workoutDates = new Set(
    logs.map((log) => new Date(log.loggedAt).toISOString().split("T")[0]),
  );

  //   Streak

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() - i);
    const dateStr = check.toISOString().split("T")[0];

    if (workoutDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break; // i === 0 means today — allow missing today
    }
  }

  //   Weekly Consistency
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const uniqueDaysThisWeek = new Set(
    logs
      .filter((log) => new Date(log.loggedAt) >= startOfWeek)
      .map((log) => new Date(log.loggedAt).toISOString().split("T")[0]),
  ).size;

  const consistencyScore = Math.min(
    Math.round((uniqueDaysThisWeek / targetDaysPerWeek) * 100),
    100,
  );

  return {
    currentStreak: streak,
    consistencyScore,
    totalWorkoutsThisWeek: uniqueDaysThisWeek,
    targetDaysPerWeek,
  };
}
