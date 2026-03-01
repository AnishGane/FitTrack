import { getUserGoal } from '@/actions/dashboard.actions'
import { getMonthlyWorkoutLogs } from '@/actions/workoutLog.actions';
import WorkoutLogForm from '@/components/forms/workout-log-form'
import { calculateStreakAndScore } from '@/lib/algorithms/recommendation'
import { WorkoutStatsSkeleton } from '@/skeletons/workout-stats-skeleton';
import { Suspense } from 'react';

const WorkoutStats = async () => {
    const { monthlyLogs } = await getMonthlyWorkoutLogs();
    const goal = await getUserGoal();
    const targetDays = goal?.targetValue ?? 3;
    const streakData = calculateStreakAndScore(monthlyLogs, targetDays);

    const totalSets = monthlyLogs.reduce((acc, log) => acc + (log.sets ?? 0), 0);
    return (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 my-4 md:my-6'>
            <div className="flex flex-col gap-1 ring-1 ring-ring/20 rounded-xl shadow-sm py-4 text-center">
                <span className="text-3xl font-bold text-destructive">{streakData.currentStreak}</span>
                <p className='text-xs text-muted-foreground'>Days Streak</p>
            </div>
            <div className="flex flex-col gap-1 ring-1 ring-ring/20 rounded-xl shadow-sm py-4 text-center">
                <span className="text-3xl font-bold text-destructive">{totalSets}</span>
                <p className='text-xs text-muted-foreground'>Total Monthly Sets</p>
            </div>
            <div className="flex flex-col gap-1 ring-1 ring-ring/20 rounded-xl shadow-sm py-4 text-center">
                <span className="text-3xl font-bold text-destructive">{streakData.consistencyScore}%</span>
                <p className='text-xs text-muted-foreground'>Weekly Goal</p>
            </div>
        </div>
    )
}

const WorkoutPage = async () => {
    return (
        <div>
            <h1 className="text-2xl font-bold">Log a Workout</h1>
            <p className="text-sm text-muted-foreground">Keep track of your progress & stay consistent.</p>

            <div className="mt-4 max-w-xl mx-auto w-full">
                <WorkoutLogForm />
                <Suspense fallback={<WorkoutStatsSkeleton />}>
                    <WorkoutStats />
                </Suspense>
            </div>
        </div >
    )
}



export default WorkoutPage