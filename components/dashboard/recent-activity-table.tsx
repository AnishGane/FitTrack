"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WorkoutLog } from "@/db/schema";

const MUSCLE_COLORS: Record<string, string> = {
    chest: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    back: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    legs: "bg-green-500/15 text-green-400 border-green-500/30",
    shoulders: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    arms: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    core: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    cardio: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    full_body: "bg-red-500/15 text-red-400 border-red-500/30",
};

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

interface RecentActivityTableProps {
    logs: WorkoutLog[];
}

const RecentActivityTable = ({ logs }: RecentActivityTableProps) => {
    return (
        <Card className="bg-card border-border sm:rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Recent Activity
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground tracking-wide">
                        Your <span className="font-semibold">10</span> most recent workouts
                    </CardDescription>
                </div>
                <Button variant="ghost" asChild className="text-primary text-sm h-auto p-0 hover:bg-transparent hover:text-primary/80">
                    <Link href="/history">View All →</Link>
                </Button>
            </CardHeader>

            <CardContent className="p-2">
                {logs.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                        No workouts logged yet.
                    </div>
                ) : (

                    <Table className="p-8">
                        <TableHeader>
                            <TableRow className="border-border bg-background/20">
                                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground/60 font-semibold">
                                    Exercise
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground/60 font-semibold">
                                    Muscle Group
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground/60 font-semibold">
                                    Sets × Reps
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground/60 font-semibold">
                                    Duration
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground/60 font-semibold">
                                    Distance
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground/60 font-semibold">
                                    Date
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log, idx) => (
                                <TableRow
                                    key={log.id}
                                    className={`border-border hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                                        }`}
                                >
                                    <TableCell className="text-foreground font-medium">
                                        {log.exerciseName}
                                        {log.isPersonalBest && (
                                            <span title="Personal Best" className="ml-2 text-[10px] text-yellow-400 font-semibold uppercase tracking-wide">
                                                🏆 PR
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        <Badge
                                            className={`border text-[10px] rounded-lg uppercase font-medium ${MUSCLE_COLORS[log.muscleGroup] ?? MUSCLE_COLORS.cardio
                                                }`}
                                        >
                                            {log.muscleGroup}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-semibold text-sm">
                                        {log.sets && log.reps
                                            ? `${log.sets}×${log.reps}`
                                            : log.sets
                                                ? `${log.sets} sets`
                                                : "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-semibold text-sm">
                                        {log.durationMin ? `${log.durationMin}m` : "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-semibold text-sm">
                                        {log.distanceKm ? `${log.distanceKm}Km` : "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-semibold text-sm">
                                        {formatDate(log.loggedAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}

export default RecentActivityTable