"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import WorkoutLogForm from "@/components/forms/workout-log-form";
import { WorkoutLog } from "@/db/schema";

interface EditWorkoutSheetProps {
    log: WorkoutLog | null;  // null = closed
    onClose: () => void;
}

export function EditWorkoutSheet({ log, onClose }: EditWorkoutSheetProps) {
    return (
        <Sheet open={!!log} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="overflow-y-auto px-2  sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Edit Workout</SheetTitle>
                </SheetHeader>
                {log && <WorkoutLogForm initialData={log} onSuccess={onClose} />}
            </SheetContent>
        </Sheet>
    );
}