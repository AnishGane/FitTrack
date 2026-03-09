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
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";

async function DashboardContent() {
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
      <div className="flex items-center justify-between mb-6 sm:mb-4">
        <h1 className="text-2xl font-medium text-foreground ">Dashboard</h1>
        <Suspense fallback={<DisplayUsernameSkeleton />}>
          <div>{displayUsername()}</div>
        </Suspense>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

const displayUsername = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }
  return (
    <p className="sm:mr-4 font-light">{showGreeting()}, <span className="font-semibold! text-lg">{session.user.name}!</span></p>
  )
}

function showGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good Morning";
  } else if (hour < 18) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

const DisplayUsernameSkeleton = () => {
  return (
    <Skeleton className="w-40 h-8 sm:mr-4 rounded-md"></Skeleton>
  )
}
