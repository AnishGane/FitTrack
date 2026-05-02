"use client"

import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowUpRight } from "lucide-react";
import { WorkoutTemplate } from "@/db/schema";
import { useWorkoutTemplateStore } from "@/store/workout-template.store";
import { MUSCLE_COLORS } from "@/constants";
import { formatMuscleGroup } from "@/lib/helper";

interface WorkoutTemplateCardProps {
    template: WorkoutTemplate;
    useCount: number;
}

const WorkoutTemplateCard = ({ template, useCount }: WorkoutTemplateCardProps) => {
    const { setTemplate } = useWorkoutTemplateStore();
    const router = useRouter();

    function handleClick() {
        setTemplate(template);
        router.push("/workout");
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    return (
        <Card
            onClick={handleClick}
            className="relative p-5 hover:ring-2 hover:ring-primary/50 transition-all duration-200 group"
        >
            {/* Top row */}
            <div className="flex justify-between items-center gap-1.5">
                <Badge className={`w-fit text-[10px] uppercase border ${MUSCLE_COLORS[template.muscleGroup ?? ""] ?? ""}`}>
                    {formatMuscleGroup(template.muscleGroup ?? "")}
                </Badge>

                {useCount > 0 && (
                    <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                        Used {useCount}×
                    </span>
                )}
            </div>

            {/* Name */}
            <h3 className="font-bold text-foreground text-base mb-1">{template.name}</h3>

            {/* Stats */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {template.defaultSets && template.defaultReps && (
                    <span className="bg-muted/30 px-2 py-0.5 rounded-full">
                        {template.defaultSets}×{template.defaultReps}
                    </span>
                )}
                {template.defaultWeightKg && (
                    <span className="bg-muted/30 px-2 py-0.5 rounded-full">
                        {template.defaultWeightKg}kg
                    </span>
                )}
                {template.defaultDurationMin && (
                    <span className="bg-muted/30 px-2 py-0.5 rounded-full">
                        {template.defaultDurationMin}min
                    </span>
                )}
                {template.defaultDistanceKm && (
                    <span className="bg-muted/30 px-2 py-0.5 rounded-full">
                        {template.defaultDistanceKm}km
                    </span>
                )}
                <span className={`px-2 py-0.5 rounded-full capitalize ${template.difficulty === "beginner" ? "text-green-400 bg-green-500/10" :
                    template.difficulty === "intermediate" ? "text-yellow-400 bg-yellow-500/10" :
                        "text-red-400 bg-red-500/10"
                    }`}>
                    {template.difficulty}
                </span>
            </div>

            {/* Hover arrow */}
            <div className="absolute right-3 top-3 hidden group-hover:flex size-7 rounded-full bg-primary items-center justify-center transition-all">
                <ArrowUpRight className="size-4 text-primary-foreground" />
            </div>
        </Card>
    );
}

export default WorkoutTemplateCard;