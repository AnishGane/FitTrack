import { getUserGoal } from '@/actions/goal.action';
import { StreakBanner, WeekProgressCard } from '@/components/goal/week-progress-card';
import GoalSetter from '@/components/goal/goal-setter'
import { GoalSetterSkeleton, StreakSkeleton, WeekProgressSkeleton } from '@/skeletons/goal-skeleton'
import { Suspense } from 'react'

async function GoalSetterSection() {
    const goal = await getUserGoal();
    return <GoalSetter initialTarget={goal?.targetValue ?? 3} />;
}

const GoalsPage = () => {
    return (
        <div className="flex flex-col gap-5 md:p-6">
            <div>
                <h1 className="text-2xl font-bold">My Goals</h1>
                <p className="text-sm text-muted-foreground">Set your weekly training target and track your progress.</p>
            </div>

            {/* Goal Setter */}
            <Suspense fallback={<GoalSetterSkeleton />}>
                <GoalSetterSection />
            </Suspense>

            {/* Week Progress */}
            <Suspense fallback={<WeekProgressSkeleton />}>
                <WeekProgressCard />
            </Suspense>

            {/* Streak Banner */}
            <Suspense fallback={<StreakSkeleton />}>
                <StreakBanner />
            </Suspense>
        </div>
    )
}

export default GoalsPage