import { Skeleton } from "@/components/ui/skeleton"

const SavedWorkoutSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 lg:grid-cols-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-xl animate-pulse" />
            ))}
        </div>
    )
}

export default SavedWorkoutSkeleton