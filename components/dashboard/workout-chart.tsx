"use client"

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Cell,
} from "recharts";
import { ChartDataPoint } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState, useRef } from "react";

function useCssVar(variable: string) {
    const [value, setValue] = useState({ hsl: "#f97316", raw: "" });
    useEffect(() => {
        const raw = getComputedStyle(document.documentElement)
            .getPropertyValue(variable).trim();
        setValue(raw ? { hsl: `hsl(${raw})`, raw } : { hsl: "#f97316", raw: "" });
    }, [variable]);
    return value;
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-sm">
            <p className="text-muted-foreground mb-1">{label}</p>
            <p className="font-semibold text-foreground">{payload[0].value} min</p>
        </div>
    );
}

interface WorkoutChartProps {
    data: ChartDataPoint[];
}

const WorkoutChart = ({ data }: WorkoutChartProps) => {
    const primaryColor = useCssVar("--primary");
    const mutedColor = useCssVar("--muted-foreground");
    const borderColor = useCssVar("--border");

    // Measure the actual container width
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        // Set initial width
        setContainerWidth(containerRef.current.offsetWidth);

        // Update on resize (e.g. rotating phone, resizing window)
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

    // On mobile: each bar gets 45px → chart scrolls
    // On desktop: use full container width so bars fill the card
    const minChartWidth = data.length * 45;
    const chartWidth = Math.max(minChartWidth, containerWidth);

    return (
        <Card className="bg-card border-border sm:rounded-3xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Workouts This Month
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Volume and frequency over time
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: "orange" }}
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
                        {/* ref measures actual rendered width */}
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
                                    stroke={borderColor.hsl}
                                    strokeDasharray="3 3"
                                    opacity={0.4}
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: mutedColor.hsl }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: mutedColor.hsl }}
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
                                                fill={isToday ? primaryColor.hsl : `${primaryColor.hsl}55`}
                                            />
                                        );
                                    })}
                                </Bar>
                            </BarChart>
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