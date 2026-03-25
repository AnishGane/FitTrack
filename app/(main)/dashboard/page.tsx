import { getDashboardData } from "@/actions/dashboard.actions";
import RecentActivityTable from "@/components/dashboard/recent-activity-table";
import RecommendationCard from "@/components/dashboard/recommendation-card";
import StreakCard from "@/components/dashboard/streak-card";
import WorkoutChart from "@/components/dashboard/workout-chart";
import { getWorkoutRecommendation } from "@/algorithms/recommendation";
import { buildChartData } from "@/lib/helper";
import { DashboardSkeleton } from "@/skeletons/dashboard-skeleton";
import { Suspense } from "react";
import { calculateStreakAndScore } from "@/algorithms/streak-consistency";
import { connection } from 'next/server';
import { format } from "date-fns";

async function DashboardContent() {
  await connection();

  const { recentLogs, allLogs, monthlyLogs, goal } = await getDashboardData();

  const targetDays = goal?.targetValue ?? 3;
  const streakData = calculateStreakAndScore(allLogs, targetDays);
  const recommendation = getWorkoutRecommendation(allLogs.slice(0, 30));
  const chartData = buildChartData(monthlyLogs);

  return (
    <div className="flex flex-col gap-6 sm:p-6 sm:bg-primary/5 rounded-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakCard data={streakData} />
        <RecommendationCard recommendation={recommendation} />
      </div>
      <WorkoutChart data={chartData} />
      <RecentActivityTable logs={recentLogs} />
    </div>
  );
}

export default async function Page() {
  return (
    <div>
      <DashboardHeader />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

const DashboardHeader = async () => {
  "use cache"
  return (
    <div className="flex items-center justify-between mb-6 sm:mb-4">
      <h1 className="text-2xl font-medium text-foreground">Dashboard</h1>
      <p className="mr-4 font-light">
        Happy {format(new Date(), "EEEE")}, Pal
      </p>
    </div>
  )
}
