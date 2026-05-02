"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapDay } from "@/types";
import { useMemo, useState } from "react";

interface WorkoutHeatmapProps {
    data: HeatmapDay[];
    totalWorkouts: number;
}

const INTENSITY_COLORS = [
    "bg-muted/30",          // 0 - none
    "bg-primary/25",        // 1 - light
    "bg-primary/50",        // 2 - moderate
    "bg-primary/75",        // 3 - heavy
    "bg-primary",           // 4 - max
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function WorkoutHeatmap({ data, totalWorkouts }: WorkoutHeatmapProps) {
    const [tooltip, setTooltip] = useState<{ date: string; count: number } | null>(null);

    // Build a 52-week grid (Sun→Sat columns)
    const grid = useMemo(() => {
        const map = new Map(data.map((d) => [d.date, d]));

        // Find the first Sunday on or before the earliest date
        const end = new Date();
        const start = new Date(end);
        start.setDate(start.getDate() - 364);

        // Pad start to Sunday
        const startDay = start.getDay();
        start.setDate(start.getDate() - startDay);

        const weeks: (HeatmapDay | null)[][] = [];
        const cur = new Date(start);

        while (cur <= end) {
            const week: (HeatmapDay | null)[] = [];
            for (let d = 0; d < 7; d++) {
                const key = cur.toISOString().split("T")[0]!;
                if (cur > end) {
                    week.push(null);
                } else {
                    week.push(map.get(key) ?? { date: key, count: 0, intensity: 0 });
                }
                cur.setDate(cur.getDate() + 1);
            }
            weeks.push(week);
        }

        return weeks;
    }, [data]);

    // Month labels: figure out which column each month starts
    const monthPositions = useMemo(() => {
        const positions: { label: string; col: number }[] = [];
        let lastMonth = -1;
        grid.forEach((week, wi) => {
            const firstDay = week.find((d) => d !== null);
            if (!firstDay) return;
            const month = new Date(firstDay.date).getMonth();
            if (month !== lastMonth) {
                positions.push({ label: MONTH_LABELS[month]!, col: wi });
                lastMonth = month;
            }
        });
        return positions;
    }, [grid]);

    const activeDays = data.filter((d) => d.count > 0).length;

    return (
        <Card className="bg-card border-border rounded-2xl">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base font-semibold">
                        Activity
                        <span className="text-xs text-muted-foreground font-normal ml-2">
                            (last 365 days)
                        </span>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{totalWorkouts} total · {activeDays} active days</span>
                        <div className="flex items-center gap-1">
                            <span>Less</span>
                            {INTENSITY_COLORS.map((cls, i) => (
                                <div key={i} className={`size-3 rounded-sm ${cls}`} />
                            ))}
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-2">
                <div className="min-w-[600px]">
                    {/* Month labels */}
                    <div className="flex mb-1 ml-7">
                        {monthPositions.map((mp) => (
                            <div
                                key={mp.col}
                                className="text-[10px] text-foreground"
                                style={{
                                    position: "relative",
                                    left: `${mp.col * 13}px`,
                                    width: 0,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {mp.label}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex gap-1">
                        {/* Day-of-week labels */}
                        <div className="flex flex-col gap-[3px] mr-1">
                            {DAY_LABELS.map((label, i) => (
                                <div key={i} className="text-[10px] text-foreground h-[10px] flex items-center w-6">
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Weeks */}
                        {grid.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-[3px]">
                                {week.map((day, di) => {
                                    if (!day) return <div key={di} className="size-[10px]" />;
                                    return (
                                        <div
                                            key={di}
                                            className={`size-[10px] rounded-sm cursor-pointer transition-all ${INTENSITY_COLORS[day.intensity]} hover:ring-1 hover:ring-primary duration-200`}
                                            onMouseEnter={() => setTooltip({ date: day.date, count: day.count })}
                                            onMouseLeave={() => setTooltip(null)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Tooltip */}
                    {tooltip && (
                        <div className="mt-2 text-xs text-muted-foreground">
                            {tooltip.count === 0
                                ? `No workouts on ${tooltip.date}`
                                : `${tooltip.count} workout${tooltip.count > 1 ? "s" : ""} on ${tooltip.date}`}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}