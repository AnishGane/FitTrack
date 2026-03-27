import { WorkoutLog } from '@/db/schema'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Shredder } from 'lucide-react'

interface ViewWorkoutDetailProps {
    log: WorkoutLog | null,
}

const ViewWorkoutDetail = ({ log }: ViewWorkoutDetailProps) => {
    return (
        <>
            <h1 className='font-semibold text-lg'>{log?.exerciseName}</h1>
            <Separator className='-my-2' />
            <div className="flex items-center flex-wrap justify-between gap-2">
                <div className="flex items-center">
                    <span className='font-semibold text-sm'>Calories Burned </span>
                    <Badge className='ml-2'>{log?.caloriesBurned ?? "-"}</Badge>
                </div>
                <div className="flex">
                    <span className='font-semibold text-sm'>Sets Done </span>
                    <Badge className='ml-2 px-3' variant={"secondary"}>{log?.sets}</Badge>
                </div>
                <div className="flex">
                    <span className='font-semibold text-sm'>Reps Completed </span>
                    <Badge className='ml-2 px-3 bg-rose-500!' >{log?.reps}</Badge>
                </div>
            </div>
            <Separator className='mt-2' />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex">
                    <p className='font-semibold text-sm'>Weight — <span className='capitalize font-normal'>{log?.weightKg} (Kg)</span></p>
                </div>
                <div className="flex">
                    <p className='font-semibold text-sm'>Duration — <span className='capitalize font-normal'>{log?.durationMin} (Min)</span></p>
                </div>
                <div className="flex">
                    <p className='font-semibold text-sm'>Distance Covered — <span className='capitalize font-normal'>{log?.distanceKm ?? 0} (Km)</span></p>
                </div>
            </div>
            <Separator className='mt-2' />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex">
                    <p className='font-semibold text-sm'>Muscle Group — <span className='capitalize font-normal'>{log?.muscleGroup}</span></p>
                </div>
                <div className="flex">
                    <p className='font-semibold text-sm'>Difficulty Level — <span className='capitalize font-normal'>{log?.difficulty}</span></p>

                </div>
            </div>
            <p>{log?.isPersonalBest ? "This is your personal best." : "Yet to be your personal best. Keep it up!"}</p>
            <Separator className='mt-2' />
            <Card className='bg-foreground/5'>
                <CardHeader className='font-semibold text-base flex justify-between items-center'>Your Note <Shredder className='size-6' /></CardHeader>

                <CardContent className='mx-4 p-0!'>
                    <p>{log?.notes}</p>
                </CardContent>
            </Card>

        </>
    )
}

export default ViewWorkoutDetail

