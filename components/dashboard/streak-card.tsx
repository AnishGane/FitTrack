"use client";

import { StreakResult } from "@/algorithms/recommendation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Flame } from "lucide-react";

// Circular SVG progress ring
function CircularProgress({ value }: { value: number }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none"
                    stroke="#AEB4A9"
                    strokeWidth="8"
                />
                {/* Progress */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none"
                    stroke="green"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            {/* Center text */}
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground font-mono">{value}%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Weekly</span>
            </div>
        </div>
    );
}

interface StreakCardProp {
    data: StreakResult
}
const StreakCard = ({ data }: StreakCardProp) => {
    const { currentStreak, consistencyScore, totalWorkoutsThisWeek, targetDaysPerWeek } = data;

    return (
        <Card className="bg-card border-border sm:p-4 sm:py-5 sm:rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
                    Streak &amp; Consistency
                </CardTitle>
                <Flame className="size-6 text-destructive" />
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Streak + Ring row */}
                <div className="flex items-center justify-between gap-4">
                    {/* Streak */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                            <span className="text-5xl">🔥</span>
                            <p className="text-5xl font-bold font-mono text-primary leading-none">
                                {currentStreak}
                            </p>
                        </div>
                        <p className="text-xs ml-1 sm:ml-3 text-muted-foreground mt-1">Days active streak</p>
                    </div>

                    {/* Circular Progress */}
                    <CircularProgress value={consistencyScore} />
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Consistency label */}
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Consistency</span>:{" "}
                    <span className="font-semibold text-foreground">
                        {totalWorkoutsThisWeek} of {targetDaysPerWeek} days met
                    </span>{" "}
                    this week.
                </p>
            </CardContent>
        </Card>
    )
}

export default StreakCard