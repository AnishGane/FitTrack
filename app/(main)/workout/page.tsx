import { getUserGoal } from '@/actions/dashboard.actions'
import { getUserTemplateUsage, getWorkoutTemplates } from '@/actions/workout-template.action';
import { getMonthlyWorkoutLogs } from '@/actions/workoutLog.actions';
import { calculateStreakAndScore } from '@/algorithms/streak-consistency';
import WorkoutLogForm from '@/components/forms/workout-log-form'
import PageHeader from '@/components/page-header';
import WorkoutTemplate from '@/components/template/workout-template';
import { Card } from '@/components/ui/card';
import { WorkoutStatsSkeleton } from '@/skeletons/workout-stats-skeleton';
import { connection } from 'next/server';
import { Suspense } from 'react';

const WorkoutStats = async () => {
    await connection(); // tells Next.js this component is dynamic, never statically cached

    const { monthlyLogs } = await getMonthlyWorkoutLogs();
    const goal = await getUserGoal();
    const targetDays = goal?.targetValue ?? 3;
    const streakData = calculateStreakAndScore(monthlyLogs, targetDays);

    const totalSets = monthlyLogs.reduce((acc, log) => acc + (log.sets ?? 0), 0);
    return (
        <Card className='px-2 md:px-4 py-4! mt-4'>

            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                <div className="flex flex-col gap-1 ring-1 ring-ring/20 rounded-xl shadow-sm bg-muted/10 py-4 text-center">
                    <span className="text-3xl font-bold text-destructive">{streakData.currentStreak}</span>
                    <p className='text-xs text-muted-foreground'>Days Streak</p>
                </div>
                <div className="flex flex-col gap-1 ring-1 ring-ring/20 rounded-xl shadow-sm bg-muted/10 py-4 text-center">
                    <span className="text-3xl font-bold text-destructive">{totalSets}</span>
                    <p className='text-xs text-muted-foreground'>Total Monthly Sets</p>
                </div>
                <div className="flex flex-col gap-1 ring-1 ring-ring/20 rounded-xl shadow-sm bg-muted/10 py-4 text-center">
                    <span className="text-3xl font-bold text-destructive">{streakData.consistencyScore}%</span>
                    <p className='text-xs text-muted-foreground'>Weekly Goal</p>
                </div>
            </div>
        </Card>
    )
}

const WorkoutTemplatesSection = async () => {

    const [templates, usageData] = await Promise.all([
        getWorkoutTemplates(),
        getUserTemplateUsage(),
    ]);
    const usageMap = Object.fromEntries(
        usageData.map((u) => [u.templateId, u.useCount])
    );
    return <WorkoutTemplate template={templates} usageMap={usageMap} />;
}

const WorkoutPage = async () => {
    return (
        <div>
            <PageHeader title="Log a Workout" description="Keep track of your progress & stay consistent." />
            <div className="flex flex-col xl:flex-row items-start xl:gap-8 gap-6 mt-6">
                <div className=" max-w-xl mx-auto w-full  flex-1">
                    <WorkoutLogForm />
                    <Suspense fallback={<WorkoutStatsSkeleton />}>
                        <WorkoutStats />
                    </Suspense>
                </div>
                <div className='flex-1'>
                    <Suspense fallback={<WorkoutStatsSkeleton />}>
                        <WorkoutTemplatesSection />
                    </Suspense>
                </div>
            </div>
        </div >
    )
}



export default WorkoutPage