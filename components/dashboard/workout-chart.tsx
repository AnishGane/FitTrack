"use client"

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Cell
} from "recharts";
import { ChartDataPoint } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState, useRef } from "react";
import { CustomTooltip } from "../custom-tooltip";

// computed color value — works with oklch, hsl, hex, any format
function useTailwindColor(className: string) {
    const [color, setColor] = useState("#111111");

    useEffect(() => {
        const el = document.createElement("div");
        el.className = className;
        el.style.display = "none";
        document.body.appendChild(el);

        const computed = getComputedStyle(el).color;
        setColor(computed || "#111111");
        document.body.removeChild(el);
    }, [className]);

    return color;
}

interface WorkoutChartProps {
    data: ChartDataPoint[];
}

const WorkoutChart = ({ data }: WorkoutChartProps) => {
    // Read colors via computed Tailwind classes that resolves oklch correctly
    const primaryColor = useTailwindColor("text-chart-2");
    const mutedColor = useTailwindColor("text-muted-foreground");
    const borderColor = useTailwindColor("text-border");

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;
        setContainerWidth(containerRef.current.offsetWidth);
        const observer = new ResizeObserver((entries) => {
            setContainerWidth(entries[0].contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const todayLabel = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
    });

    const minChartWidth = data.length * 45;
    const chartWidth = Math.max(minChartWidth, containerWidth);

    // Muted version of primary 
    const primaryMuted = "oklch(0.6746 0.1414 261.338/ 0.65)";

    return (
        <Card className="bg-card border-border sm:rounded-2xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Workouts This Month
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Volume and frequency over time
                    </p>
                </div>
                {/* Legend dot uses inline style with resolved color */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                    />
                    Workout Duration (min)
                </div>
            </CardHeader>

            <CardContent className="px-2">
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                        No workout data yet. Log your first workout!
                    </div>
                ) : (
                    <>
                        <div ref={containerRef} className="overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                            <BarChart
                                width={chartWidth}
                                height={220}
                                data={data}
                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                barCategoryGap="30%"
                            >
                                <CartesianGrid
                                    vertical={false}
                                    stroke={borderColor}
                                    strokeDasharray="3 3"
                                    opacity={0.4}
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: mutedColor }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: mutedColor }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                                />
                                <Bar dataKey="duration" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                    {data.map((entry) => {
                                        const isToday = entry.date.trim() === todayLabel.trim();
                                        return (
                                            <Cell
                                                key={entry.date}
                                                fill={isToday ? primaryColor : primaryMuted}
                                            />
                                        );
                                    })}
                                </Bar>
                            </BarChart>
                            {/* Legend */}
                            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block size-3 rounded-sm"
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                    <span>Today</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block size-3 rounded-sm"
                                        style={{ backgroundColor: primaryMuted }}
                                    />
                                    <span>Other Days</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-1 sm:hidden">
                            ← Scroll to see more →
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default WorkoutChart;