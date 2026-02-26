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
  const grouped = new Map<string, { duration: number; workouts: number }>();

  for (const log of logs) {
    const date = new Date(log.loggedAt);
    const key = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

    const existing = grouped.get(key) ?? { duration: 0, workouts: 0 };
    grouped.set(key, {
      duration: existing.duration + (log.durationMin ?? 0),
      workouts: existing.workouts + 1,
    });
  }

  // Sort by date ascending for chart
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({
      date: new Date(key).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      duration: val.duration,
      workouts: val.workouts,
    }));
}
