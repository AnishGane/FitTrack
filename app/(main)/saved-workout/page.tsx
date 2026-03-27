import { getSavedWorkouts } from "@/actions/common/common.action"
import { getUserId, getWorkoutLogs } from "@/actions/workoutLog.actions";
import DisplaySavedWorkout from "@/components/saved-workout/display-saved-workout";
import SavedWorkoutSkeleton from "@/skeletons/saved-workout-skeleton";
import { connection } from "next/server";
import { Suspense } from "react";

async function DisplaySavedWorkoutSection() {
    await connection();
    const savedWorkouts = await getSavedWorkouts();

    const userId = await getUserId();
    const logs = await getWorkoutLogs(userId);

    return <DisplaySavedWorkout savedWorkouts={savedWorkouts} logs={logs} />
}
const SavedWorkoutPage = () => {
    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold">Saved Workouts</h1>
                <p className="text-sm text-muted-foreground">View and manage your saved workouts.</p>
            </div>

            <Suspense fallback={<SavedWorkoutSkeleton />}>
                <DisplaySavedWorkoutSection />
            </Suspense>
        </div>
    )
}

export default SavedWorkoutPage