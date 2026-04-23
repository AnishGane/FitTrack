import { Skeleton } from "@/components/ui/skeleton";

export function GoalSetterSkeleton() {
    return <Skeleton className="h-96 w-full rounded-xl" />;
}

export function WeekProgressSkeleton() {
    return <Skeleton className="h-56 w-full rounded-xl" />;
}

export function StreakSkeleton() {
    return <Skeleton className="h-20 w-full rounded-xl" />;
}