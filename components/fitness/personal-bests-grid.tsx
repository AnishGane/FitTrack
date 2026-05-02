"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MUSCLE_COLORS } from "@/constants";
import { formatMuscleGroup } from "@/lib/helper";
import { format } from "date-fns";
import { Trophy } from "lucide-react";
import { PersonalBest } from "@/types";

interface PersonalBestsGridProps {
    bests: PersonalBest[];
}

export default function PersonalBestsGrid({ bests }: PersonalBestsGridProps) {
    if (bests.length === 0) return null;

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Trophy className="size-4 text-yellow-400" />
                <h2 className="text-base font-semibold text-foreground">Personal Bests</h2>
                <span className="text-xs text-muted-foreground">(per exercise)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {bests.map((pb) => {
                    const colorClass = MUSCLE_COLORS[pb.muscleGroup] ?? "";

                    return (
                        <Card
                            key={`${pb.exerciseName}-${pb.muscleGroup}`}
                            className="bg-card p-2 border-border rounded-2xl"
                        >
                            <CardContent className="p-4 flex flex-col gap-3">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-foreground text-sm leading-tight">
                                            {pb.exerciseName}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {format(new Date(pb.achievedAt), "MMM dd, yyyy")}
                                        </p>
                                    </div>
                                    <Badge className={`border text-[10px] uppercase shrink-0 ${colorClass}`}>
                                        {formatMuscleGroup(pb.muscleGroup)}
                                    </Badge>
                                </div>

                                {/* Stats */}
                                <div className="flex flex-wrap gap-2">
                                    {pb.bestWeightKg != null && (
                                        <div className="flex flex-col items-center bg-muted/30 rounded-xl px-3 py-2 min-w-18 border border-border">
                                            <span className="text-lg font-bold text-foreground">{pb.bestWeightKg}</span>
                                            <span className="text-[10px] text-muted-foreground">kg</span>
                                        </div>
                                    )}
                                    {pb.bestReps != null && (
                                        <div className="flex flex-col items-center bg-muted/30 rounded-xl px-3 py-2 min-w-18 border border-border">
                                            <span className="text-lg font-bold text-foreground">{pb.bestReps}</span>
                                            <span className="text-[10px] text-muted-foreground">reps</span>
                                        </div>
                                    )}
                                    {pb.bestDurationMin != null && (
                                        <div className="flex flex-col items-center bg-muted/30 rounded-xl px-3 py-2 min-w-18 border border-border">
                                            <span className="text-lg font-bold text-foreground">{pb.bestDurationMin}</span>
                                            <span className="text-[10px] text-muted-foreground">min</span>
                                        </div>
                                    )}
                                    {pb.bestDistanceKm != null && (
                                        <div className="flex flex-col items-center bg-muted/30 rounded-xl px-3 py-2 min-w-14">
                                            <span className="text-lg font-bold text-foreground">{pb.bestDistanceKm}</span>
                                            <span className="text-[10px] text-muted-foreground">km</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}