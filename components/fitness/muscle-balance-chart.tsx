"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MUSCLE_COLORS } from "@/constants";
import { formatMuscleGroup } from "@/lib/helper";
import { MuscleGroupVolume } from "@/types";

interface MuscleBalanceChartProps {
    data: MuscleGroupVolume[];
}

export default function MuscleBalanceChart({ data }: MuscleBalanceChartProps) {
    const maxCount = Math.max(...data.map((d) => d.workoutCount), 1);

    return (
        <Card className="bg-card border-border rounded-2xl pr-2 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                    Muscle Balance
                    <span className="text-xs text-muted-foreground font-normal ml-2">
                        by workout count
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {data.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
                )}
                {data.map((item) => {
                    const pct = (item.workoutCount / maxCount) * 100;
                    const colorClass = MUSCLE_COLORS[item.muscleGroup] ?? "bg-primary/15 text-primary border-primary/30";
                    // Extract the text color for the bar
                    const barColor = colorClass.includes("orange")
                        ? "bg-orange-500"
                        : colorClass.includes("blue")
                            ? "bg-blue-500"
                            : colorClass.includes("green")
                                ? "bg-green-500"
                                : colorClass.includes("purple")
                                    ? "bg-purple-500"
                                    : colorClass.includes("pink")
                                        ? "bg-pink-500"
                                        : colorClass.includes("yellow")
                                            ? "bg-yellow-500"
                                            : colorClass.includes("cyan")
                                                ? "bg-cyan-500"
                                                : colorClass.includes("red")
                                                    ? "bg-red-500"
                                                    : "bg-primary";

                    return (
                        <div key={item.muscleGroup} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-16 shrink-0 capitalize">
                                {formatMuscleGroup(item.muscleGroup)}
                            </span>
                            <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-foreground w-8 text-right shrink-0">
                                {item.workoutCount}
                            </span>
                        </div>
                    );
                })}

                {/* Legend note */}
                {data.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                            {data[0] && (
                                <>
                                    Most trained:{" "}
                                    <span className="font-semibold text-foreground capitalize">
                                        {formatMuscleGroup(data[0].muscleGroup)}
                                    </span>{" "}
                                    ({data[0].percentage}% of workouts)
                                </>
                            )}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}