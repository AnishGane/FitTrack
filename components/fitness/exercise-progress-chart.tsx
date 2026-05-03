"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { MUSCLE_COLORS } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { formatMuscleGroup } from "@/lib/helper";
import { ExerciseProgress } from "@/types";

interface ExerciseProgressChartProps {
    exercises: ExerciseProgress[];
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-sm">
            <p className="text-muted-foreground mb-1 text-xs">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} className="font-semibold text-foreground">
                    {p.value} {p.name}
                </p>
            ))}
        </div>
    );
}

export default function ExerciseProgressChart({ exercises }: ExerciseProgressChartProps) {
    const [selected, setSelected] = useState(0);

    const exercise = exercises[selected];
    if (!exercise) return null;

    // Pick the best metric to show
    const hasWeight = exercise.dataPoints.some((d) => d.weightKg != null);
    const hasDistance = exercise.dataPoints.some((d) => d.distanceKm != null);

    const metric = hasWeight ? "weightKg" : hasDistance ? "distanceKm" : "durationMin";
    const metricLabel = metric === "weightKg" ? "kg" : metric === "distanceKm" ? "km" : "min";

    const chartData = exercise.dataPoints
        .filter((d) => d[metric as keyof typeof d] != null)
        .map((d) => ({
            date: d.date.slice(5), // MM-DD
            value: d[metric as keyof typeof d] as number,
        }));

    const colorClass = MUSCLE_COLORS[exercise.muscleGroup] ?? "";

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold text-foreground">Exercise Progress</h2>
                <span className="text-xs text-muted-foreground">(top exercises by frequency)</span>
            </div>

            <Card className="bg-card border-border rounded-2xl">
                <CardHeader className="pb-2">
                    {/* Exercise switcher tabs */}
                    <div className="flex flex-wrap gap-2">
                        {exercises.map((ex, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelected(idx)}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${selected === idx
                                    ? "bg-primary text-primary-foreground border-primary font-medium"
                                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                                    }`}
                            >
                                {ex.exerciseName}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <Badge className={`border text-[10px] uppercase ${colorClass}`}>
                            {formatMuscleGroup(exercise.muscleGroup)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {exercise.dataPoints.length} sessions tracked
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                            Tracking: <span className="font-medium text-foreground">{metricLabel}</span>
                        </span>
                    </div>

                    {chartData.length < 2 ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                            Not enough data yet — log more {exercise.exerciseName} sessions to see progress.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -30, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" opacity={0.4} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    className="fill-muted-foreground"
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    className="fill-muted-foreground"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    name={metricLabel}
                                    stroke="oklch(0.6487 0.1538 150.3071)"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "oklch(0.6487 0.1538 150.3071)", strokeWidth: 0 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}