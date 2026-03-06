import { Skeleton } from "@/components/ui/skeleton";

export function HistoryTableSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-48 md:h-32 w-full rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
        </div>
    );
}