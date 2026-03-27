"use client";

import { SavedWorkout, WorkoutLog } from "@/db/schema"
import SavedWorkoutCard from "./saved-workout-card";
import { useSavedWorkoutsStore } from "@/store/saved-workouts.store";
import { useEffect } from "react";

interface DisplaySavedWorkoutProps {
    savedWorkouts: SavedWorkout[];
    logs: WorkoutLog[]
}
const DisplaySavedWorkout = ({ savedWorkouts, logs }: DisplaySavedWorkoutProps) => {

    const { setSaved } = useSavedWorkoutsStore();

    useEffect(() => {
        for (const log of logs) {
            const match = savedWorkouts.find(
                (s) => s.name === log.exerciseName && s.muscleGroup === log.muscleGroup
            );
            if (match) {
                setSaved(log.id, match.id);
            }
        }
    }, [logs, savedWorkouts]);

    return (
        <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {savedWorkouts.length === 0 && (
                    <div className="col-span-4 text-center text-muted-foreground h-60 flex flex-col gap-1 justify-center">
                        <h1 className="text-xl font-medium">No saved workouts</h1>
                        <p className="text-xs md:text-sm text-muted-foreground/80">Saved the workouts you like to have quick access.</p>
                    </div>
                )}
                {savedWorkouts.map((workout) => {
                    const matchingLog = logs.find(
                        (l) => l.exerciseName === workout.name && l.muscleGroup === workout.muscleGroup
                    );
                    return (
                        <SavedWorkoutCard key={workout.id} workout={workout} logId={matchingLog?.id ?? null} />
                    )
                }
                )}
            </div>
        </div>
    )
}

export default DisplaySavedWorkout