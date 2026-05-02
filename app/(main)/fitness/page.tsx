import { getFitnessStats } from "@/actions/fitness.actions";
import FitnessClient from "@/components/fitness/fitness-client";
import PageHeader from "@/components/page-header"
import FitnessSkeleton from "@/skeletons/fitness-skeleton"
import { Suspense } from "react"

async function FitnessContent() {
    const stats = await getFitnessStats();
    return <FitnessClient stats={stats} />;
}

const FitnessPage = async () => {
    return (
        <div>
            <PageHeader
                title="Fitness Tracking"
                description="A deep look at your training volume, personal bests, and long-term progress."
            />
            <Suspense fallback={<FitnessSkeleton />}>
                <FitnessContent />
            </Suspense>
        </div>
    )
}

export default FitnessPage