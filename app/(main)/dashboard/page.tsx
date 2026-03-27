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
import { getSavedWorkouts } from "@/actions/common/common.action";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

async function DashboardContent() {
  const { recentLogs, allLogs, monthlyLogs, goal } = await getDashboardData();
  const savedWorkoutsList = await getSavedWorkouts();

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
      <RecentActivityTable logs={recentLogs} savedWorkouts={savedWorkoutsList} />
    </div>
  );
}

export default async function Page() {
  return (
    <div>
      <Suspense fallback={null}>
        <DashboardHeader />
      </Suspense>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
