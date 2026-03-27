import { Skeleton } from "@/components/ui/skeleton"

export const WorkoutStatsSkeleton = () => {
    return (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 my-4 md:my-6'>
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='rounded-xl shadow-sm py-4 h-24' />
            ))}
        </div>
    )
}