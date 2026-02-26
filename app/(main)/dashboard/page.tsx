import { getDashboardData } from "@/actions/dashboard.actions";
import RecentActivityTable from "@/components/dashboard/recent-activity-table";
import RecommendationCard from "@/components/dashboard/recommendation-card";
import StreakCard from "@/components/dashboard/streak-card";
import WorkoutChart from "@/components/dashboard/workout-chart";
import { ModeToggle } from "@/components/mode-toggle";
import { calculateStreakAndScore, getWorkoutRecommendation } from "@/lib/algorithms/recommendation";
import { buildChartData } from "@/lib/helper";
import { DashboardSkeleton } from "@/skeletons/dashboard-skeleton";
import { Suspense } from "react";

async function DashboardContent() {
  const { recentLogs, allLogs, monthlyLogs, goal } = await getDashboardData();

  const targetDays = goal?.targetValue ?? 3;
  const streakData = calculateStreakAndScore(allLogs, targetDays);
  const recommendation = getWorkoutRecommendation(allLogs.slice(0, 30));
  const chartData = buildChartData(monthlyLogs);

  return (
    <div className="flex flex-col gap-6 sm:p-6 sm:bg-neutral-200/20 rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <div className="cols-span-2"> */}
        <StreakCard data={streakData} />
        {/* </div> */}
        {/* <div className="col-span-2"> */}
        <RecommendationCard recommendation={recommendation} />
        {/* </div> */}
        {/* <div>
          Hello
        </div> */}
      </div>
      <WorkoutChart data={chartData} />
      <RecentActivityTable logs={recentLogs} />
    </div>
  );
}

export default async function Page() {
  return (
    <div>
      <div className="">
        <h1 className="text-2xl font-medium mb-4 text-foreground">Dashboard</h1>
        <ModeToggle />
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
