import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton shown while DashboardContent fetches data
export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
        </div>
    );
}