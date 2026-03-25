import { getUserGoal } from '@/actions/goal.action';
import { StreakBanner, WeekProgressCard } from '@/components/goal/week-progress-card';
import GoalSetter from '@/components/goal/goal-setter'
import { GoalSetterSkeleton, StreakSkeleton, WeekProgressSkeleton } from '@/skeletons/goal-skeleton'
import { Suspense } from 'react'
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';

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

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Week Progress */}
                <Suspense fallback={<WeekProgressSkeleton />}>
                    <WeekProgressCard />
                </Suspense>

                <Card className="relative w-full sm:flex-1 h-64 rounded-3xl">
                    {/* Overlay */}
                    <div className='bg-linear-to-b from-transparent via-black/70 to-black absolute z-8 w-full h-full'></div>
                    <Image
                        src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="workout"
                        fill
                        priority={false}
                        className="object-cover rounded-lg"
                    />

                    <div className='absolute bottom-6 left-4 z-10 text-white'>
                        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/60 mb-1">Daily Reminder</p>
                        <p className="text-lg sm:text-2xl font-semibold leading-tight italic">"Push beyond your limits."</p>
                    </div>s
                </Card>
            </div>

            {/* Streak Banner */}
            <Suspense fallback={<StreakSkeleton />}>
                <StreakBanner />
            </Suspense>
        </div>
    )
}

export default GoalsPage