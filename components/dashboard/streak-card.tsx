"use client";

import { StreakResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Circular SVG progress ring
function CircularProgress({ value }: { value: number }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none"
                    stroke="#6A706260"
                    strokeWidth="8"
                />

                {/* Progress — apply filter here */}
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
                <span className="text-2xl font-bold text-foreground font-mono">{value}%</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Weekly</span>
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
        <Card className="bg-card border-border sm:p-4 flex justify-between sm:rounded-2xl">
            <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
                    Streak &amp; Consistency
                </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4 mb-1">
                {/* Streak + Ring row */}
                <div className="flex items-center justify-between gap-4">
                    {/* Streak */}
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-7xl font-bold font-mono text-primary mt-2 leading-none">
                            {currentStreak}
                        </p>
                        <p className="text-[14px] ml-1 sm:ml-3 text-muted-foreground mt-1">Days active streak</p>
                    </div>

                    {/* Circular Progress */}
                    <CircularProgress value={consistencyScore} />
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {totalWorkoutsThisWeek === targetDaysPerWeek ? (
                    <p className="text-sm text-muted-foreground">Congratulation! You have 100% consistency this week. 🎉</p>
                ) : (
                    <>
                        {/* Consistency label */}
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Consistency</span>:{" "}
                            <span className="font-semibold text-foreground">
                                {totalWorkoutsThisWeek} of {targetDaysPerWeek} days met
                            </span>{" "}
                            this week.
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default StreakCard