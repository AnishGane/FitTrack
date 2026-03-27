import { getFilteredWorkoutHistory } from '@/actions/history.actions'
import HistoryStatsCard from '@/components/history/history-stats-card'
import { WorkoutHistoryTable } from '@/components/history/workout-history-table'
import { Button } from '@/components/ui/button'
import { HistoryStatsCardsSkeleton } from '@/skeletons/history-stats-card-skeleton'
import { HistoryTableSkeleton } from '@/skeletons/history-table-skeleton'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { getSavedWorkouts } from '@/actions/common/common.action'

async function HistoryTableSection() {
    await connection();

    const initialData = await getFilteredWorkoutHistory({ page: 1, limit: 10 });
    const savedWorkoutList = await getSavedWorkouts();
    return <WorkoutHistoryTable initialData={initialData} savedWorkouts={savedWorkoutList} />;
}

const HistoryPage = () => {
    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Workout History</h1>
                    <p className="text-sm text-muted-foreground">Review and manage your past training sessions.</p>
                </div>
                <Link href="/workout">
                    <Button className='py-5 w-full cursor-pointer font-semibold'><Plus className="size-4" />Log new workout</Button>
                </Link>
            </div>

            <Suspense fallback={<HistoryStatsCardsSkeleton />}>
                <HistoryStatsCard />
            </Suspense>
            <Suspense fallback={<HistoryTableSkeleton />}>
                <HistoryTableSection />
            </Suspense>
        </div>
    )
}

export default HistoryPage