"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { ChartDataPoint } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-sm">
            <p className="text-muted-foreground mb-1">{label}</p>
            <p className="font-semibold text-foreground">
                {payload[0].value} min
            </p>
            {payload[1] && (
                <p className="text-muted-foreground text-xs">
                    {payload[1].value} workout{payload[1].value !== 1 ? "s" : ""}
                </p>
            )}
        </div>
    );
}

interface WorkoutChartProps {
    data: ChartDataPoint[];
}

const WorkoutChart = ({ data }: WorkoutChartProps) => {
    // Highlight today's bar
    const todayLabel = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
    });


    return (
        <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Workouts This Month
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Volume and frequency over time
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-block w-3 h-3 rounded-full bg-primary" />
                    Workout Duration (min)
                </div>
            </CardHeader>

            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                        No workout data yet. Log your first workout!
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                            data={data}
                            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                            barCategoryGap="30%"
                        >
                            <CartesianGrid
                                vertical={false}
                                stroke="hsl(var(--border))"
                                strokeDasharray="3 3"
                                opacity={0.4}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                            />
                            <Bar dataKey="duration" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                {data.map((entry) => (
                                    <Cell
                                        key={entry.date}
                                        fill={
                                            entry.date === todayLabel
                                                ? "hsl(var(--primary))"           // today = bright orange
                                                : "hsl(var(--primary) / 0.35)"    // other days = muted
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}

export default WorkoutChart