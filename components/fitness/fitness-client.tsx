"use client";

import KpiGrid from "./kpi-grid";
import WeeklyVolumeChart from "./weekly-volume-chart";
import MuscleBalanceChart from "./muscle-balance-chart";
import WorkoutHeatmap from "./workout-heatmap";
import PersonalBestsGrid from "./personal-bests-grid";
import ExerciseProgressChart from "./exercise-progress-chart";
import { FitnessStats } from "@/types";

interface FitnessClientProps {
    stats: FitnessStats;
}

export default function FitnessClient({ stats }: FitnessClientProps) {
    if (stats.totalWorkouts === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-5xl mb-4">🏋️</p>
                <h2 className="text-xl font-semibold text-foreground">No workout data yet</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    Start logging workouts to see your fitness tracking dashboard come to life.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            {/* Row 1 — KPI summary cards */}
            <KpiGrid stats={stats} />

            {/* Row 2 — Weekly volume + Muscle balance */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <WeeklyVolumeChart data={stats.weeklyVolume} />
                </div>
                <div className="lg:col-span-2">
                    <MuscleBalanceChart data={stats.muscleGroupVolumes} />
                </div>
            </div>

            {/* Row 3 — Activity heatmap */}
            <WorkoutHeatmap data={stats.heatmap} totalWorkouts={stats.totalWorkouts} />

            {/* Row 4 — Personal Bests */}
            <PersonalBestsGrid bests={stats.personalBests} />

            {/* Row 5 — Exercise progress */}
            {stats.topExerciseProgress.length > 0 && (
                <ExerciseProgressChart exercises={stats.topExerciseProgress} />
            )}
        </div>
    );
}