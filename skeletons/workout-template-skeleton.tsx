import { Skeleton } from "@/components/ui/skeleton"

const WorkoutTemplateSkeleton = () => {
    return (
        <div className="mt-8">
            <Skeleton className="w-full rounded-md h-12 animate-pulse" />
            <div className="flex  items-center justify-center gap-3 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-full rounded-lg h-44 animate-pulse" />
                ))}
            </div>
        </div>
    )
}

export default WorkoutTemplateSkeleton