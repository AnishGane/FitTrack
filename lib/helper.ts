import { WorkoutLog } from "@/db/schema";

export const getInitialsFromName = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

export function formatMuscleGroup(muscleGroup: string) {
  return muscleGroup.split("_").join(" ");
}

// Chart Data Helper
export interface ChartDataPoint {
  date: string; // "Oct 01"
  duration: number; // total minutes
  workouts: number; // count of workouts
}

/**
 * Transforms raw workout logs into chart-ready data points.
 * Groups logs by date and sums duration per day.
 */

export function buildChartData(logs: WorkoutLog[]): ChartDataPoint[] {
  // Step 1 — group existing logs by date
  const grouped = new Map<string, { duration: number; workouts: number }>();

  for (const log of logs) {
    const date = new Date(log.loggedAt);
    const key = date.toISOString().split("T")[0]; // YYYY-MM-DD

    const existing = grouped.get(key) ?? { duration: 0, workouts: 0 };
    grouped.set(key, {
      duration: existing.duration + (log.durationMin ?? 0),
      workouts: existing.workouts + 1,
    });
  }

  // Step 2 — fill ALL 30 days, even ones with no workout
  const result: ChartDataPoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = date.toISOString().split("T")[0]; // YYYY-MM-DD for lookup
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

    const existing = grouped.get(key);

    result.push({
      date: label,
      duration: existing?.duration ?? 0, // 0 if no workout that day
      workouts: existing?.workouts ?? 0,
    });
  }

  return result;
}
