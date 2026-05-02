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

// fitness actions types

export interface PersonalBest {
  exerciseName: string;
  muscleGroup: string;
  bestWeightKg: number | null;
  bestReps: number | null;
  bestDurationMin: number | null;
  bestDistanceKm: number | null;
  achievedAt: Date;
}

export interface MuscleGroupVolume {
  muscleGroup: string;
  totalSets: number;
  totalReps: number;
  totalDurationMin: number;
  workoutCount: number;
  percentage: number; // % of total workouts
}

export interface WeeklyVolumePoint {
  weekLabel: string; // "Week 1", "Week 2" etc.
  weekStart: string; // ISO date string
  totalSets: number;
  totalReps: number;
  totalDurationMin: number;
  workoutCount: number;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number; // number of workouts on that day
  intensity: 0 | 1 | 2 | 3 | 4; // 0=none, 1=light, 2=moderate, 3=heavy, 4=max
}

export interface ExerciseProgress {
  exerciseName: string;
  muscleGroup: string;
  dataPoints: {
    date: string;
    weightKg: number | null;
    reps: number | null;
    durationMin: number | null;
    distanceKm: number | null;
  }[];
}

export interface FitnessStats {
  // Summary KPIs
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalDurationMin: number;
  totalCaloriesBurned: number;
  totalDistanceKm: number;
  longestStreak: number;
  currentStreak: number;

  // Personal Bests (top 5 by weight or duration)
  personalBests: PersonalBest[];

  // Muscle balance
  muscleGroupVolumes: MuscleGroupVolume[];

  // Weekly volume for last 12 weeks
  weeklyVolume: WeeklyVolumePoint[];

  // Heatmap for last 365 days
  heatmap: HeatmapDay[];

  // Top 5 most-trained exercises with progress
  topExerciseProgress: ExerciseProgress[];

  // Goal info
  goalTarget: number;
}
