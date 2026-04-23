export type ActionResult =
  | { success: true; message: string; savedId?: string }
  | { success: false; message: string };

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

export interface StreakResult {
  currentStreak: number;
  consistencyScore: number; // 0–100
  totalWorkoutsThisWeek: number;
  targetDaysPerWeek: number;
}

// Chart Data Helper
export interface ChartDataPoint {
  date: string; // "Oct 01"
  duration: number; // total minutes
  workouts: number; // count of workouts
}

export type DayBubbleProps = {
  label: string;
  isToday: boolean;
  hasWorkout: boolean;
  isFuture: boolean;
};
