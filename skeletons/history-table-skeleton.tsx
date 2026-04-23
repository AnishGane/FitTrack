import { Skeleton } from "@/components/ui/skeleton";

export function HistoryTableSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-48 md:h-32 w-full rounded-xl" />
            <Skeleton className="h-6 w-24 rounded-xl" />
            <Skeleton className="h-128 w-full rounded-xl" />
        </div>
    );
}