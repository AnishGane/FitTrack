"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyVolumePoint } from "@/types";
import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface WeeklyVolumeChartProps {
    data: WeeklyVolumePoint[];
}

type Metric = "workoutCount" | "totalSets" | "totalDurationMin";

const METRICS: { key: Metric; label: string; unit: string }[] = [
    { key: "workoutCount", label: "Workouts", unit: "" },
    { key: "totalSets", label: "Sets", unit: "" },
    { key: "totalDurationMin", label: "Duration (min)", unit: "m" },
];

function CustomTooltip({ active, payload, label, unit }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-sm">
            <p className="text-muted-foreground mb-1">{label}</p>
            <p className="font-semibold text-foreground">
                {payload[0].value}{unit}
            </p>
        </div>
    );
}

export default function WeeklyVolumeChart({ data }: WeeklyVolumeChartProps) {
    const [metric, setMetric] = useState<Metric>("workoutCount");
    const selected = METRICS.find((m) => m.key === metric)!;

    return (
        <Card className="bg-card border-border rounded-2xl h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base font-semibold">
                        Weekly Volume
                        <span className="text-xs text-muted-foreground font-normal ml-2">
                            (last 12 weeks)
                        </span>
                    </CardTitle>
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                        {METRICS.map((m) => (
                            <button
                                key={m.key}
                                onClick={() => setMetric(m.key)}
                                className={`text-xs px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${metric === m.key
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" opacity={0.4} />
                        <XAxis
                            dataKey="weekLabel"
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
                        <Tooltip content={<CustomTooltip unit={selected.unit} />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                        <Bar
                            dataKey={metric}
                            radius={[4, 4, 0, 0]}
                            fill="oklch(0.6487 0.1538 150.3071)"
                            maxBarSize={36}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}