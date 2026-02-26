"use client";

import { WorkoutRecommendation } from "@/lib/algorithms/recommendation";
import { Button } from "../ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowRight, Zap } from "lucide-react";
import { formatMuscleGroup } from "@/lib/helper";


// Muscle group → badge color mapping (matches your design system)
const MUSCLE_COLORS: Record<string, string> = {
    chest: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    back: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    legs: "bg-green-500/15 text-green-400 border-green-500/30",
    shoulders: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    arms: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    core: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    cardio: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    full_body: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface RecommendationCardProps {
    recommendation: WorkoutRecommendation;
}

const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {

    const { muscleGroup, reason, suggestedExercises } = recommendation;
    const colorClass = MUSCLE_COLORS[muscleGroup] ?? MUSCLE_COLORS.cardio;

    return (
        <Card className="bg-card ring-2 ring-accent flex flex-col sm:p-4 sm:py-5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                        Today&apos;s Recommendation
                    </CardTitle>
                    <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px] uppercase tracking-wide border">
                        Recommended
                    </Badge>
                </div>
                <Zap className="h-4 w-4 text-yellow-400" />
            </CardHeader>

            <CardContent className="flex flex-col flex-1 gap-4">
                {/* Title */}
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Train Today:{" "}
                        <span className="text-primary uppercase">{formatMuscleGroup(muscleGroup)}</span>
                    </h2>
                    <p className="text-xs tracking-wide text-muted-foreground mt-1">
                        Reason: {reason}
                    </p>
                </div>

                {/* Exercise badges */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 ">
                    {suggestedExercises.map((ex, idx) => (
                        <div
                            key={ex}
                            className={`rounded-md border flex items-center gap-3 px-3 sm:min-w-40 py-2 text-xs font-medium ${colorClass}`}
                        >
                            <span className="bg-white/50 backdrop-blur-3xl text-lg ring ring-ring p-1 px-3.5 rounded-full">{idx + 1}</span>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                                    Target
                                </p>
                                <span className="font-semibold tracking-wide text-sm">
                                    {ex}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <Button
                    asChild
                    className="w-full mt-auto bg-primary hover:bg-primary/90 text-primary-foreground py-5 font-semibold"
                    size="lg"
                >
                    <Link href="/workout" className="flex items-center justify-center gap-2">
                        Log This Workout
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

export default RecommendationCard