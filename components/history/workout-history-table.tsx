"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, ListFilter, X, ChevronLeft, ChevronRight, Trash, Loader2, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getFilteredWorkoutHistory, type WorkoutHistoryResult } from "@/actions/history.actions";
import { DIFFICULTY_COLORS, HISTORY_MUSCLE_GROUPS, MUSCLE_COLORS } from "@/constants";
import { formatMuscleGroup } from "@/lib/helper";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteWorkoutAction } from "@/actions/common/common.action";
import { useSaveWorkout } from "@/hooks/use-save-workout";
import { SavedWorkout } from "@/db/schema";
import { useSavedWorkoutsStore } from "@/store/saved-workouts.store";

interface WorkoutHistoryTableProps {
    initialData: WorkoutHistoryResult;
    savedWorkouts: SavedWorkout[];
}

export function WorkoutHistoryTable({ initialData, savedWorkouts }: WorkoutHistoryTableProps) {
    // Filter state
    const [muscleGroup, setMuscleGroup] = useState("all");
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

    // Result state 
    const [data, setData] = useState<WorkoutHistoryResult>(initialData);
    const [isPending, startTransition] = useTransition();
    const [isDeletePending, startDeleteTransition] = useTransition();

    const [openDialogId, setOpenDialogId] = useState<string | null>(null);
    const router = useRouter();

    const { handleSaveWorkout, getStatus } = useSaveWorkout();
    const { setSaved } = useSavedWorkoutsStore();

    useEffect(() => {
        for (const log of data.logs) {
            const match = savedWorkouts.find(
                (s) => s.name === log.exerciseName && s.muscleGroup === log.muscleGroup
            );
            if (match) {
                setSaved(log.id, match.id);
            }
        }
    }, [data.logs, savedWorkouts]);

    // Fetch with current filters
    const fetchData = useCallback((page: number, mg: string, from?: Date, to?: Date) => {
        startTransition(async () => {
            const result = await getFilteredWorkoutHistory({
                muscleGroup: mg,
                dateFrom: from,
                dateTo: to,
                page,
                limit: 10,
            });
            setData(result);
        });
    }, []);

    function handleDelete(id: string) {
        startDeleteTransition(async () => {
            const response = await deleteWorkoutAction(id);
            if (response.success) {
                toast.success(response.message);
                setOpenDialogId(null);
                fetchData(1, "all", undefined, undefined);
                router.refresh();
            } else {
                toast.error("Failed to delete workout. Please try again.");
                setOpenDialogId(null);
            }
        });
    }

    // Apply filters (reset to page 1)
    function handleApplyFilters() {
        fetchData(1, muscleGroup, dateFrom, dateTo);
    }

    // Clear all filters
    function handleClearFilters() {
        setMuscleGroup("all");
        setDateFrom(undefined);
        setDateTo(undefined);
        fetchData(1, "all", undefined, undefined);
    }

    // Pagination
    function handlePageChange(newPage: number) {
        fetchData(newPage, muscleGroup, dateFrom, dateTo);
    }

    const hasActiveFilters = muscleGroup !== "all" || dateFrom || dateTo;

    return (
        <div className="flex flex-col gap-4">

            {/* Filter Bar */}
            <Card className="border-border">
                <CardContent className="flex items-end flex-wrap lg:flex-nowrap gap-4 md:gap-8 p-4">
                    {/* Muscle Group Select */}
                    <Field className="md:max-w-60">
                        <FieldLabel htmlFor="filter-muscle-group">MUSCLE GROUP</FieldLabel>
                        <Select value={muscleGroup} onValueChange={setMuscleGroup}>
                            <SelectTrigger id="filter-muscle-group">
                                <SelectValue placeholder="Select muscle group" />
                            </SelectTrigger>
                            <SelectContent>
                                {HISTORY_MUSCLE_GROUPS.map((g) => (
                                    <SelectItem key={g.value} value={g.value}>
                                        {g.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    {/* Date From */}
                    <Field>
                        <FieldLabel>DATE RANGE</FieldLabel>
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start font-normal min-w-36">
                                        {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From date"}
                                        <CalendarIcon className="ml-auto size-4 text-muted-foreground" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateFrom}
                                        onSelect={setDateFrom}
                                        defaultMonth={dateFrom}
                                        disabled={(d) => dateTo ? d > dateTo : false}
                                    />
                                </PopoverContent>
                            </Popover>

                            <span className="text-muted-foreground text-sm">to</span>

                            {/* Date To */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start font-normal min-w-36">
                                        {dateTo ? format(dateTo, "MMM dd, yyyy") : "To date"}
                                        <CalendarIcon className="ml-auto size-4 text-muted-foreground" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateTo}
                                        onSelect={setDateTo}
                                        defaultMonth={dateTo}
                                        disabled={(d) => dateFrom ? d < dateFrom : false}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </Field>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleApplyFilters}
                            disabled={isPending}
                            className="cursor-pointer px-6 py-4.5"
                        >
                            <ListFilter className="size-4 mr-1.5" />
                            {isPending ? "Filtering..." : "Apply Filters"}
                        </Button>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                onClick={handleClearFilters}
                                disabled={isPending}
                                className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <X className="size-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results count */}
            <div className="flex items-center justify-between px-1 mt-2">
                <p className="text-sm text-muted-foreground">
                    {isPending ? "Loading..." : (
                        <>
                            <span className="font-medium text-foreground">{data.totalCount}</span>
                            {" "}workout{data.totalCount !== 1 ? "s" : ""} found
                        </>
                    )}
                </p>
                {hasActiveFilters && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>Filtered by:</span>
                        {muscleGroup !== "all" && (
                            <Badge className={`border text-[10px] uppercase ${MUSCLE_COLORS[muscleGroup] ?? ""}`}>
                                {muscleGroup}
                            </Badge>
                        )}
                        {dateFrom && <Badge variant="outline" className="text-[10px]">{format(dateFrom, "MMM dd")}</Badge>}
                        {dateTo && <Badge variant="outline" className="text-[10px]">→ {format(dateTo, "MMM dd")}</Badge>}
                    </div>
                )}
            </div>

            {/* Table */}
            <Card className="border-border px-2">
                <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
                    {data.logs.length === 0 && !isPending ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <p className="text-4xl mb-3">🏋️</p>
                            <p className="font-medium text-foreground">No workouts found</p>
                            <p className="text-sm mt-1">
                                {hasActiveFilters
                                    ? "Try adjusting your filters"
                                    : "Log your first workout to see it here"}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Exercise</TableHead>
                                    <TableHead className="text-xs uppercase tracking-widest text-center font-semibold text-muted-foreground">Muscle Group</TableHead>
                                    <TableHead className="text-xs uppercase tracking-widest text-center font-semibold text-muted-foreground">Sets × Reps</TableHead>
                                    <TableHead className="text-xs uppercase tracking-widest text-center font-semibold text-muted-foreground">Weight</TableHead>
                                    <TableHead className="text-xs uppercase tracking-widest text-center font-semibold text-muted-foreground">Duration</TableHead>
                                    <TableHead className="text-xs uppercase tracking-widest text-center font-semibold text-muted-foreground">Difficulty</TableHead>
                                    <TableHead className="text-xs uppercase tracking-widest text-center font-semibold text-muted-foreground">Date</TableHead>
                                    <TableHead className="text-xs uppercase tracking-widest text-center font-semibold text-muted-foreground">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-center">
                                {isPending
                                    //  Loading skeletons
                                    ? Array.from({ length: 10 }).map((_, i) => (
                                        <TableRow key={i} className="border-border">
                                            {Array.from({ length: 8 }).map((_, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-10 w-full rounded" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                    // Actual rows
                                    : data.logs.map((log) => {
                                        const formattedMuscleGroup = formatMuscleGroup(log.muscleGroup);
                                        return (
                                            <TableRow key={log.id} className="border-border hover:bg-muted/20 transition-colors">
                                                <TableCell className="font-medium text-left text-foreground capitalize">
                                                    {log.exerciseName}
                                                    {log.isPersonalBest && (
                                                        <span className="ml-1.5 text-[10px] text-yellow-400 font-semibold">🏆 PR</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`border text-xs uppercase ${MUSCLE_COLORS[log.muscleGroup] ?? ""}`}>
                                                        {formattedMuscleGroup}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-muted-foreground">
                                                    {log.sets && log.reps ? `${log.sets}×${log.reps}` : log.sets ? `${log.sets} sets` : "—"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {log.weightKg ? `${log.weightKg}kg` : "—"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {log.durationMin ? `${log.durationMin}m` : "—"}
                                                </TableCell>
                                                <TableCell className={`text-sm font-medium capitalize ${DIFFICULTY_COLORS[log.difficulty] ?? ""}`}>
                                                    {log.difficulty}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {log.loggedAt ? format(new Date(log.loggedAt), "MMM dd, yyyy") : "—"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground flex items-center justify-center text-center">
                                                    <AlertDialog
                                                        open={openDialogId === log.id}
                                                        onOpenChange={(open) => {
                                                            if (!isDeletePending) setOpenDialogId(open ? log.id : null);
                                                        }}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button onClick={() => setOpenDialogId(log.id)} variant="ghost" className="rounded-sm! text-destructive hover:bg-transparent! cursor-pointer hover:rounded-sm! font-semibold!">
                                                                <Trash />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="font-semibold">Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    You are about to delete <span className="text-primary font-semibold">{log.exerciseName}</span> from workout log. This action cannot be undone. This will permanently this workout log
                                                                    from our servers.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel variant={"outline"} disabled={isDeletePending} className="cursor-pointer py-4.5 px-5">No, Keep it</AlertDialogCancel>
                                                                <Button
                                                                    onClick={() => handleDelete(log.id)}
                                                                    disabled={isDeletePending}
                                                                    className="cursor-pointer p-4.5"
                                                                >
                                                                    {isDeletePending ? (
                                                                        <>
                                                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                                                            Deleting
                                                                        </>
                                                                    ) : (
                                                                        "Yes, Delete it"
                                                                    )}
                                                                </Button>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <Button
                                                        disabled={getStatus(log.id).status === "saving" || getStatus(log.id).status === "unsaving"}
                                                        onClick={() => handleSaveWorkout(log.id)} variant={"ghost"} className="cursor-pointer">
                                                        {getStatus(log.id).status === "saving" ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : getStatus(log.id).status === "saved" ? (
                                                            <Heart className="size-4 fill-rose-500 stroke-rose-500" />
                                                        ) :
                                                            getStatus(log.id).status === "unsaving" ? (<>
                                                                <Loader2 className="size-4 animate-spin" />
                                                            </>) : (
                                                                <Heart className="size-4" />
                                                            )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                    )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-muted-foreground">
                        Page {data.currentPage} of {data.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(data.currentPage - 1)}
                            disabled={data.currentPage <= 1 || isPending}
                            className="cursor-pointer"
                        >
                            <ChevronLeft className="size-4" />
                            Prev
                        </Button>

                        {/* Page number buttons — show max 5 around current page */}
                        {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                            .filter(p =>
                                p === 1 ||
                                p === data.totalPages ||
                                Math.abs(p - data.currentPage) <= 1
                            )
                            .reduce<(number | "...")[]>((acc, p, i, arr) => {
                                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === "..." ? (
                                    <span key={`ellipsis-${i}`} className="text-muted-foreground px-1">...</span>
                                ) : (
                                    <Button
                                        key={p}
                                        variant={data.currentPage === p ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(p as number)}
                                        disabled={isPending}
                                        className="cursor-pointer min-w-8"
                                    >
                                        {p}
                                    </Button>
                                )
                            )
                        }

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(data.currentPage + 1)}
                            disabled={data.currentPage >= data.totalPages || isPending}
                            className="cursor-pointer"
                        >
                            Next
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}