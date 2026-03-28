import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { MUSCLE_COLORS } from "@/constants";
import { Button } from "../ui/button";
import { ArrowUpRight, Heart, Loader2 } from "lucide-react";
import { SavedWorkout } from "@/db/schema";
import { unsaveWorkoutLogAction } from "@/actions/common/common.action";
import { useSavedWorkoutsStore } from "@/store/saved-workouts.store";

interface SavedWorkoutCardProps {
    workout: SavedWorkout;
    logId: string | null;
}

const IMAGE_ARRAY = [
    "https://images.unsplash.com/photo-1613685044678-0a9ae422cf5a?q=80&w=765&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1641337221253-fdc7237f6b61?q=80&w=1470&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584863231364-2edc166de576?q=80&w=1470&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1675026482188-8102367ecc16?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
]

const SavedWorkoutCard = ({ workout, logId }: SavedWorkoutCardProps) => {
    const imageSrc = useMemo(() => {
        const index = workout.id
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0) % IMAGE_ARRAY.length;
        return IMAGE_ARRAY[index];
    }, [workout.id]);

    const [isPending, startTransition] = useTransition();
    const { setIdle } = useSavedWorkoutsStore();
    const router = useRouter();

    function handleUnsave() {
        startTransition(async () => {
            const result = await unsaveWorkoutLogAction(workout.id); // workout.id is the savedId
            if (result.success) {
                toast.success(result.message);

                if (logId) {
                    setIdle(logId);
                }

                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <Card className="relative py-0 overflow-hidden rounded-2xl cursor-pointer group">
            <div className="absolute inset-0 z-10 bg-linear-to-b from-transparent via-black/70 to-black/95" />

            <Image
                src={imageSrc}
                alt={workout.name}
                className="relative z-0 aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                width={400}
                height={400}
            />

            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex flex-col gap-2">
                <Badge className={`w-fit text-[10px] uppercase border ${MUSCLE_COLORS[workout.muscleGroup] ?? ""}`}>
                    {workout.muscleGroup}
                </Badge>

                <p className="text-white font-bold text-lg leading-tight">
                    {workout.name}
                </p>

                <div className="text-white/70 text-xs">
                    <span className="capitalize">{workout.difficulty}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white/80 w-fit text-xs mt-1">
                        {workout.sets && workout.reps && <span>{workout.sets}×{workout.reps}</span>}
                        {workout.weightKg && <span>{workout.weightKg}kg</span>}
                        {workout.durationMin && <span>{workout.durationMin}min</span>}
                        {workout.distanceKm && <span>{workout.distanceKm}km</span>}
                    </div>

                    {/* Always filled heart — this IS the saved workouts page */}
                    <Button
                        variant="ghost"
                        onClick={handleUnsave}
                        disabled={isPending}
                        className="cursor-pointer rounded-full"
                    >
                        {isPending
                            ? <Loader2 className="size-4 animate-spin text-white" />
                            : <Heart className="size-4 fill-rose-500 stroke-rose-500" />
                        }
                    </Button>
                </div>
            </div>

            <div className="absolute right-4 hidden group-hover:flex top-4 rounded-full transition-all duration-400 ease-in-out bg-white size-9 justify-center items-center">
                <ArrowUpRight className="text-black size-5" />
            </div>
        </Card >
    )
}

export default SavedWorkoutCard