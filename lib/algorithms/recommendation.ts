import type { WorkoutLog } from "@/db/schema";
import { formatMuscleGroup } from "../helper";

export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "cardio"
  | "full_body";

export interface WorkoutRecommendation {
  muscleGroup: MuscleGroup;
  reason: string;
  suggestedExercises: string[];
  recoveryStatus: "fully_recovered" | "partially_recovered" | "needs_rest";
  daysSinceLastTrained: number | null;
}

// How many days each muscle group needs to recover before training again
const RECOVERY_DAYS: Record<MuscleGroup, number> = {
  chest: 2,
  back: 2,
  legs: 2,
  shoulders: 1,
  arms: 1,
  core: 1,
  cardio: 0,
  full_body: 2,
};

// Suggested exercises shown in the recommendation card
const EXERCISE_MAP: Record<MuscleGroup, string[]> = {
  chest: ["Bench Press", "Incline Press", "Push-ups", "Chest Flys"],
  back: ["Pull-ups", "Barbell Row", "Lat Pulldown", "Deadlift"],
  legs: ["Squats", "Lunges", "Leg Press", "Romanian Deadlift"],
  shoulders: ["Overhead Press", "Lateral Raises", "Front Raises", "Face Pulls"],
  arms: ["Bicep Curls", "Tricep Dips", "Hammer Curls", "Skull Crushers"],
  core: ["Plank", "Crunches", "Leg Raises", "Russian Twists"],
  cardio: ["Running", "Cycling", "Jump Rope", "Swimming"],
  full_body: ["Deadlift", "Clean & Press", "Burpees", "Kettlebell Swings"],
};

/**
 * GREEDY WORKOUT RECOMMENDER ALGORITHM
 *
 * Strategy:
 * 1. For each muscle group, find the most recent date it was trained
 * 2. Calculate days since last trained
 * 3. Check if it has fully recovered (daysSince >= recoveryNeeded)
 * 4. Score each recovered group by days since trained (more days = higher priority)
 * 5. Greedily pick the highest scoring group = most overdue + fully recovered
 *
 * If everything is still recovering → pick cardio (always safe)
 * If never trained → highest priority (returns Infinity score)
 *
 * Time Complexity:  O(n) — single pass through logs to build lastTrained map
 * Space Complexity: O(m) — m = number of muscle groups (constant = 8)
 */

export function getWorkoutRecommendation(
  logs: WorkoutLog[],
): WorkoutRecommendation {
  const allGroups: MuscleGroup[] = [
    "chest",
    "back",
    "legs",
    "shoulders",
    "arms",
    "core",
    "cardio",
    "full_body",
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Step 1: Build lastTrained map
  // O(n) — single pass, keeps only the most recent date per group
  const lastTrained = new Map<MuscleGroup, Date>();

  for (const log of logs) {
    const group = log.muscleGroup as MuscleGroup;
    const logDate = new Date(log.loggedAt);
    logDate.setHours(0, 0, 0, 0);

    const existing = lastTrained.get(group);
    if (!existing || logDate > existing) {
      lastTrained.set(group, logDate);
    }
  }

  // Step 2: Score each muscle group
  let bestGroup: MuscleGroup = "cardio";
  let bestScore = -Infinity;

  for (const group of allGroups) {
    const last = lastTrained.get(group);
    const recoveryNeeded = RECOVERY_DAYS[group];

    if (!last) {
      // Never trained → infinite priority
      const score = Infinity;
      if (score > bestScore) {
        bestScore = score;
        bestGroup = group;
      }
      continue;
    }

    const daysSince = Math.floor(
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Only consider groups that have finished recovering
    if (daysSince >= recoveryNeeded) {
      const score = daysSince; // more days overdue = higher priority
      if (score > bestScore) {
        bestScore = score;
        bestGroup = group;
      }
    }
  }

  // Step 3: Build the result object
  const lastTrainedDate = lastTrained.get(bestGroup);
  const daysSince = lastTrainedDate
    ? Math.floor(
        (today.getTime() - lastTrainedDate.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;

  const recoveryNeeded = RECOVERY_DAYS[bestGroup];
  let recoveryStatus: WorkoutRecommendation["recoveryStatus"] =
    "fully_recovered";
  if (daysSince !== null && daysSince < recoveryNeeded) {
    recoveryStatus = daysSince === 0 ? "needs_rest" : "partially_recovered";
  }

  let reason: string;
  if (daysSince === null) {
    reason = `You've never trained ${formatMuscleGroup(bestGroup)} — perfect time to start!`;
  } else if (daysSince === 0) {
    reason = `${bestGroup} was trained today. Consider rest or light cardio.`;
  } else if (daysSince === 1) {
    reason = `Last trained yesterday. Muscle recovery optimal.`;
  } else {
    reason = `Last trained ${daysSince} days ago. Muscle recovery optimal.`;
  }

  return {
    muscleGroup: bestGroup,
    reason,
    suggestedExercises: EXERCISE_MAP[bestGroup].slice(0, 3),
    recoveryStatus,
    daysSinceLastTrained: daysSince,
  };
}

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
