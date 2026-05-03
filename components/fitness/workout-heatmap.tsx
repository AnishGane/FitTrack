"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapDay } from "@/types";
import { useMemo, useRef, useState, useEffect } from "react";

interface WorkoutHeatmapProps {
    data: HeatmapDay[];
    totalWorkouts: number;
}

const INTENSITY_COLORS = [
    "bg-muted/40",      // 0 - none
    "bg-primary/25",    // 1 - light
    "bg-primary/50",    // 2 - moderate
    "bg-primary/75",    // 3 - heavy
    "bg-primary",       // 4 - max
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function WorkoutHeatmap({ data, totalWorkouts }: WorkoutHeatmapProps) {
    const [tooltip, setTooltip] = useState<{ date: string; count: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cellSize, setCellSize] = useState(12);

    // Build the 52-week grid
    const grid = useMemo(() => {
        const map = new Map(data.map((d) => [d.date, d]));

        const end = new Date();
        const start = new Date(end);
        start.setDate(start.getDate() - 364);

        // Pad back to Sunday
        start.setDate(start.getDate() - start.getDay());

        const weeks: (HeatmapDay | null)[][] = [];
        const cur = new Date(start);

        while (cur <= end) {
            const week: (HeatmapDay | null)[] = [];
            for (let d = 0; d < 7; d++) {
                const key = cur.toISOString().split("T")[0]!;
                week.push(
                    cur > end
                        ? null
                        : map.get(key) ?? { date: key, count: 0, intensity: 0 }
                );
                cur.setDate(cur.getDate() + 1);
            }
            weeks.push(week);
        }

        return weeks;
    }, [data]);

    // Compute cell size from container width so it always fills the card
    useEffect(() => {
        if (!containerRef.current) return;

        const DAY_LABEL_WIDTH = 20;
        const GAP = 2;

        const compute = () => {
            const available = containerRef.current!.clientWidth - DAY_LABEL_WIDTH;
            const numWeeks = grid.length || 53;
            const size = Math.floor((available - (numWeeks - 1) * GAP) / numWeeks);
            setCellSize(Math.max(6, Math.min(size, 14)));
        };

        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [grid.length]);

    // Month label positions
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
    const GAP = 2;
    const DAY_LABEL_WIDTH = 20;

    return (
        <Card className="bg-card border-border rounded-2xl w-full">
            <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-base font-semibold">
                        Activity
                        <span className="text-xs text-muted-foreground font-normal ml-2">
                            (last 365 days)
                        </span>
                    </CardTitle>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                        <span className="shrink-0">
                            {totalWorkouts} total · {activeDays} active days
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                            <span>Less</span>
                            {INTENSITY_COLORS.map((cls, i) => (
                                <div key={i} className={`size-3 rounded-sm ${cls}`} />
                            ))}
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-3 sm:px-6">
                <div ref={containerRef} className="w-full">
                    {/* Month labels row — mirrors the grid columns exactly */}
                    <div className="flex mb-1" style={{ gap: GAP }}>
                        {/* Spacer matching the day-label column */}
                        <div style={{ width: DAY_LABEL_WIDTH, flexShrink: 0 }} />

                        {/* One flex-1 slot per week column, label only on month-start columns */}
                        <div className="flex flex-1" style={{ gap: GAP }}>
                            {grid.map((_, wi) => {
                                const mp = monthPositions.find((m) => m.col === wi);
                                return (
                                    <div
                                        key={wi}
                                        className="flex-1  overflow-hidden"
                                        style={{ height: 22 }}
                                    >
                                        {mp && (
                                            <span className="text-[10px] text-muted-foreground leading-none whitespace-nowrap">
                                                {mp.label}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Grid body: day labels + week columns */}
                    <div className="flex" style={{ gap: GAP }}>
                        {/* Day-of-week labels */}
                        <div
                            className="flex flex-col shrink-0"
                            style={{ gap: GAP, width: DAY_LABEL_WIDTH }}
                        >
                            {DAY_LABELS.map((label, i) => (
                                <div
                                    key={i}
                                    className="flex items-center text-[10px] text-muted-foreground"
                                    style={{ height: cellSize + 4 }}
                                >
                                    {(i === 1 || i === 3 || i === 5) ? label : ""}
                                </div>
                            ))}
                        </div>

                        {/* Week columns */}
                        <div className="flex flex-1" style={{ gap: GAP }}>
                            {grid.map((week, wi) => (
                                <div
                                    key={wi}
                                    className="flex flex-col flex-1"
                                    style={{ gap: GAP }}
                                >
                                    {week.map((day, di) => {
                                        if (!day) {
                                            return <div key={di} style={{ height: cellSize }} />;
                                        }
                                        return (
                                            <div
                                                key={di}
                                                className={`rounded-sm cursor-pointer transition-opacity ${INTENSITY_COLORS[day.intensity]} hover:ring-1 hover:ring-primary hover:opacity-80`}
                                                style={{ height: cellSize + 4 }}
                                                onMouseEnter={() =>
                                                    setTooltip({ date: day.date, count: day.count })
                                                }
                                                onMouseLeave={() => setTooltip(null)}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tooltip */}
                    <div className="mt-2 h-4 ml-6">
                        {tooltip && (
                            <p className="text-xs text-muted-foreground">
                                {tooltip.count === 0
                                    ? `No workouts on ${tooltip.date}`
                                    : `${tooltip.count} workout${tooltip.count > 1 ? "s" : ""} on ${tooltip.date}`}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}