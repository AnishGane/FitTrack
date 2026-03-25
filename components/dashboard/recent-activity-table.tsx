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
import { format } from "date-fns";
import { MUSCLE_COLORS } from "@/constants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreHorizontalIcon, Pen, Trash, Loader2, View } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkoutAction } from "@/actions/common/common.action";
import { formatMuscleGroup } from "@/lib/helper";
import { EditWorkoutSheet } from "./edit-workout-sheet";
import ViewWorkoutDetail from "./view-workout-detail";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

interface RecentActivityTableProps {
    logs: WorkoutLog[];
}

const RecentActivityTable = ({ logs }: RecentActivityTableProps) => {

    const [isPending, startTransition] = useTransition();
    const [openDialogId, setOpenDialogId] = useState<string | null>(null);
    const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
    const [viewLog, setViewLog] = useState<WorkoutLog | null>(null);
    const router = useRouter();

    function handleDelete(id: string) {
        startTransition(async () => {
            const response = await deleteWorkoutAction(id);
            if (response.success) {
                toast.success(response.message);
                setOpenDialogId(null);
                router.refresh();
            } else {
                toast.error("Failed to delete workout. Please try again.");
                setOpenDialogId(null);
            }
        })
    }

    return (
        <>
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
                        <Link href="/history">View All</Link>
                    </Button>
                </CardHeader>

                <CardContent className="p-2 sm:px-4">
                    {logs.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                            No workouts logged yet.
                        </div>
                    ) : (

                        <Table>
                            <TableHeader>
                                <TableRow className="border-border bg-background/20">
                                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground/60 font-semibold">
                                        Exercise
                                    </TableHead>
                                    <TableHead className="text-xs uppercase tracking-wide text-center text-muted-foreground/60 font-semibold">
                                        Muscle Group
                                    </TableHead>
                                    <TableHead className="text-xs uppercase tracking-wide text-center text-muted-foreground/60 font-semibold">
                                        Sets × Reps
                                    </TableHead>
                                    <TableHead className="text-xs uppercase tracking-wide text-center text-muted-foreground/60 font-semibold">
                                        Duration
                                    </TableHead>
                                    <TableHead className="text-xs uppercase tracking-wide text-center text-muted-foreground/60 font-semibold">
                                        Distance
                                    </TableHead>
                                    <TableHead className="text-xs uppercase tracking-wide text-center text-muted-foreground/60 font-semibold">
                                        Logged Date
                                    </TableHead>
                                    <TableHead className="text-xs uppercase tracking-wide text-center text-muted-foreground/60 font-semibold">
                                        Last Modified Date
                                    </TableHead>
                                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground/60  text-center font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-center">
                                {logs.map((log, idx) => {
                                    const formattedMuscleGroup = formatMuscleGroup(log.muscleGroup);
                                    return (
                                        <TableRow
                                            key={log.id}
                                            className={`border-border hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                                                }`}
                                        >
                                            <TableCell className="text-foreground font-medium text-left">
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
                                                    {formattedMuscleGroup}
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
                                                {format(log.loggedAt, "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-semibold text-sm">
                                                {format(log.updatedAt, "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-semibold text-sm text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                                                            <MoreHorizontalIcon />
                                                            <span className="sr-only">Open table options</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingLog(log)} className="gap-2">
                                                            <Pen />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setViewLog(log)} className="gap-2">
                                                            <View />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog
                                                            open={openDialogId === log.id}
                                                            onOpenChange={(open) => {
                                                                if (!isPending) setOpenDialogId(open ? log.id : null);
                                                            }}>
                                                            <AlertDialogTrigger asChild>
                                                                <Button onClick={() => setOpenDialogId(log.id)} variant="ghost" className="w-full text-left justify-start rounded-md! text-destructive hover:bg-destructive/60! hover:text-destructive-foreground! cursor-pointer hover:rounded-md! font-semibold!">
                                                                    <Trash />
                                                                    Delete
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="font-semibold">Are you absolutely sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently this workout log
                                                                        from our servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel variant={"ghost"} disabled={isPending} className="cursor-pointer p-4.5">Cancel</AlertDialogCancel>
                                                                    <Button
                                                                        onClick={() => handleDelete(log.id)}
                                                                        disabled={isPending}
                                                                        className="cursor-pointer p-4.5"
                                                                    >
                                                                        {isPending ? (
                                                                            <>
                                                                                <Loader2 className="size-4 mr-2 animate-spin" />
                                                                                Deleting...
                                                                            </>
                                                                        ) : (
                                                                            "Continue"
                                                                        )}
                                                                    </Button>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card >

            <EditWorkoutSheet
                log={editingLog}
                onClose={() => setEditingLog(null)}
            />

            {/* Dialog for the workout details */}
            <Dialog
                open={!!viewLog}
                onOpenChange={(open) => {
                    if (!open) setViewLog(null);
                }}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="font-semibold text-xl">Workout Details</DialogTitle>
                        <DialogDescription className="text-xs sm:text-[13px] -mt-1.5">
                            {viewLog ? `Logged at ${format(viewLog.loggedAt, "MMM dd, yyyy")}` : null}
                        </DialogDescription>
                    </DialogHeader>

                    {viewLog && <ViewWorkoutDetail log={viewLog} />}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="py-4 cursor-pointer">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default RecentActivityTable
