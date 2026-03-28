"use client"

import { CARDIO_GROUPS, DIFFICULTIES, MUSCLE_GROUPS } from "@/constants";
import { WorkoutLogFormValue, WorkoutLogSchema } from "@/validation/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { logWorkoutAction, updateWorkoutAction } from "@/actions/workoutLog.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CardDescription } from "../ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWorkoutPrefillStore } from "@/store/workout-prefill.store";
import { WorkoutLog } from "@/db/schema";
import { useWorkoutTemplateStore } from "@/store/workout-template.store";

interface WorkoutLogFormtProps {
    initialData?: WorkoutLog //undefined - add mode, defined - edit mode
    onSuccess?: () => void //called after a succcessful submit
}

const EMPTY_DEFAULTS: WorkoutLogFormValue = {
    exerciseName: "",
    muscleGroup: undefined as any,
    difficulty: undefined as any,
    sets: "" as any,
    reps: "" as any,
    weightKg: "" as any,
    durationMin: "" as any,
    distanceKm: "" as any,
    caloriesBurned: "" as any,
    notes: "",
    isPersonalBest: false,
    templateId: undefined
};

function toFormValues(data: WorkoutLog): WorkoutLogFormValue {
    return {
        exerciseName: data.exerciseName,
        muscleGroup: data.muscleGroup as any,
        difficulty: data.difficulty as any,
        sets: data.sets ?? ("" as any),
        reps: data.reps ?? ("" as any),
        weightKg: data.weightKg ?? ("" as any),
        durationMin: data.durationMin ?? ("" as any),
        distanceKm: data.distanceKm ?? ("" as any),
        caloriesBurned: data.caloriesBurned ?? ("" as any),
        notes: data.notes ?? "",
        isPersonalBest: data.isPersonalBest ?? false,
    };
}

function getFieldError(message?: string) {
    return message === "Expected number, received nan"
        ? "Please enter a valid number"
        : message ?? "";
}

const WorkoutLogForm = ({ initialData, onSuccess }: WorkoutLogFormtProps) => {
    const isEditing = !!initialData;
    const { exerciseName, muscleGroup, clearPrefill } = useWorkoutPrefillStore();
    const { selectedTemplate, clearTemplate } = useWorkoutTemplateStore();

    const form = useForm<WorkoutLogFormValue>({
        resolver: zodResolver(WorkoutLogSchema),
        mode: "all",
        defaultValues: initialData ? toFormValues(initialData) : EMPTY_DEFAULTS,
    });

    useEffect(() => {
        if (!isEditing && selectedTemplate) {
            form.reset({
                exerciseName: selectedTemplate.name,
                muscleGroup: selectedTemplate.muscleGroup as any,
                difficulty: selectedTemplate.difficulty as any,
                sets: selectedTemplate.defaultSets ?? undefined,
                reps: selectedTemplate.defaultReps ?? undefined,
                weightKg: selectedTemplate.defaultWeightKg ?? undefined,
                durationMin: selectedTemplate.defaultDurationMin ?? undefined,
                distanceKm: selectedTemplate.defaultDistanceKm ?? undefined,
                caloriesBurned: selectedTemplate.defaultCaloriesBurned ?? undefined,
                notes: "",
                isPersonalBest: false,
                templateId: selectedTemplate.id
            });
            clearTemplate();
        }
    }, [selectedTemplate]);

    // Prefill from recommendation (add mode only)
    useEffect(() => {
        if (!isEditing && (exerciseName || muscleGroup)) {
            form.setValue("exerciseName", exerciseName, { shouldValidate: true });
            form.setValue("muscleGroup", muscleGroup as any, { shouldValidate: true });
            clearPrefill();
        }
    }, [exerciseName, muscleGroup]);

    // Reset when switching between different logs in edit mode
    useEffect(() => {
        if (initialData) {
            form.reset(toFormValues(initialData));
        }
    }, [initialData?.id]);

    const { isSubmitting } = form.formState;
    const router = useRouter();

    // Watch muscleGroup to conditionally show/hide fields
    const selectedMuscleGroup = form.watch("muscleGroup");
    const isCardio = CARDIO_GROUPS.includes(selectedMuscleGroup);

    async function onSubmit(values: WorkoutLogFormValue) {
        try {
            const result = isEditing
                ? await updateWorkoutAction(initialData.id, values)
                : await logWorkoutAction(values);

            if (result.success) {
                toast.success(result.message);
                if (isEditing) {
                    onSuccess?.();
                } else {
                    form.reset(EMPTY_DEFAULTS);
                    router.refresh();
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    }

    return (
        <Card className={cn("w-full", isEditing && "bg-transparent! overflow-y-auto")}>
            <CardContent>
                <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        {/* Row 1: Exercise Name */}
                        <Controller
                            name="exerciseName"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-exercisename">
                                        Exercise Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-demo-exercisename"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="e.g. Bench Press"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        {/* Row 2: Muscle Group + Difficulty */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                name="muscleGroup"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-musclegroup">
                                            Muscle Group
                                        </FieldLabel>
                                        <Select key={field.value ?? "mg-empty"} onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select muscle group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MUSCLE_GROUPS.map((group) => (
                                                    <SelectItem key={group.value} value={group.value}>
                                                        <span className="flex items-center gap-2">
                                                            <span>{group.emoji}</span>
                                                            {group.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="difficulty"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-difficulty">
                                            Difficulty
                                        </FieldLabel>
                                        <Select key={field.value ?? "d-empty"} onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select difficulty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DIFFICULTIES.map((d) => (
                                                    <SelectItem key={d.value} value={d.value}>
                                                        <span className={`font-medium ${d.color}`}>
                                                            {d.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Row 3: Strength fields (hidden for cardio) */}
                        {!isCardio && (
                            <div className="grid grid-cols-3 gap-4">
                                <Controller
                                    name="sets"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="form-rhf-demo-sets">
                                                Sets
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="form-rhf-demo-sets"
                                                aria-invalid={fieldState.invalid}
                                                type="number"
                                                value={field.value as string ?? ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder="3"
                                                autoComplete="off"
                                                inputMode="numeric"
                                                {...{ min: 1, max: 100 }}
                                            />
                                            <FieldError
                                                errors={[{
                                                    ...fieldState.error,
                                                    message: getFieldError(fieldState.error?.message),
                                                }]}
                                            />
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="reps"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="form-rhf-demo-reps">
                                                Reps
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="form-rhf-demo-reps"
                                                aria-invalid={fieldState.invalid}
                                                type="number"
                                                value={field.value as string ?? ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder="10"
                                                autoComplete="off"
                                                inputMode="numeric"
                                                {...{ min: 1, max: 10000 }}
                                            />
                                            <FieldError
                                                errors={[{
                                                    ...fieldState.error,
                                                    message: getFieldError(fieldState.error?.message),
                                                }]}
                                            />
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="weightKg"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="form-rhf-demo-weightKg">
                                                Weight
                                            </FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    {...field}
                                                    id="form-rhf-demo-weightKg"
                                                    aria-invalid={fieldState.invalid}
                                                    type="number"
                                                    value={field.value as string ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    placeholder="40"
                                                    autoComplete="off"
                                                    inputMode="numeric"
                                                    {...{ step: 0.5, min: 0, max: 200 }}
                                                />
                                                <InputGroupAddon align={"inline-end"}>Kg</InputGroupAddon>
                                            </InputGroup>
                                            <FieldError
                                                errors={[{
                                                    ...fieldState.error,
                                                    message: getFieldError(fieldState.error?.message),
                                                }]}
                                            />
                                        </Field>
                                    )}
                                />
                            </div>
                        )}

                        {/*  Row 4: Duration + Distance + Calories  */}
                        <div className={cn("grid grid-cols-1 gap-4", isCardio ? "md:grid-cols-3" : "md:grid-cols-2")}>
                            <Controller
                                name="durationMin"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-durationMin">
                                            Duration
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                id="form-rhf-demo-durationMin"
                                                aria-invalid={fieldState.invalid}
                                                type="number"
                                                value={field.value as string ?? ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder="30"
                                                autoComplete="off"
                                                inputMode="numeric"
                                                {...{ min: 1, max: 600 }}
                                            />
                                            <InputGroupAddon align={"inline-end"}>mins</InputGroupAddon>
                                        </InputGroup>
                                        <FieldError
                                            errors={[{
                                                ...fieldState.error,
                                                message: getFieldError(fieldState.error?.message),
                                            }]}
                                        />
                                    </Field>
                                )}
                            />

                            {isCardio && (
                                <Controller
                                    name="distanceKm"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="form-rhf-demo-distanceKm">
                                                Distance
                                            </FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    {...field}
                                                    id="form-rhf-demo-distanceKm"
                                                    aria-invalid={fieldState.invalid}
                                                    type="number"
                                                    value={field.value as string ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    placeholder="2.5"
                                                    autoComplete="off"
                                                    inputMode="numeric"
                                                    {...{ min: 0, max: 1000 }}
                                                />
                                                <InputGroupAddon align={"inline-end"}>km</InputGroupAddon>
                                            </InputGroup>
                                            <FieldError
                                                errors={[{
                                                    ...fieldState.error,
                                                    message: getFieldError(fieldState.error?.message),
                                                }]}
                                            />
                                        </Field>
                                    )}
                                />
                            )}

                            <Controller
                                name="caloriesBurned"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-caloriesBurned">
                                            Calories Burned
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                id="form-rhf-demo-caloriesBurned"
                                                aria-invalid={fieldState.invalid}
                                                type="number"
                                                value={field.value as string ?? ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder="320"
                                                autoComplete="off"
                                                inputMode="numeric"
                                                {...{ min: 0, max: 10000 }}
                                            />
                                            <InputGroupAddon align={"inline-end"}>Kcal</InputGroupAddon>
                                        </InputGroup>
                                        <FieldError
                                            errors={[{
                                                ...fieldState.error,
                                                message: getFieldError(fieldState.error?.message),
                                            }]}
                                        />
                                    </Field>
                                )}
                            />
                        </div>

                        {/*  Row 5: Notes  */}
                        <Controller
                            name="notes"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-notes">
                                        Notes
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        id="form-rhf-demo-notes"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Workout notes..."
                                        autoComplete="off"
                                        className="resize-none  h-30"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Row 6: Personal Best checkbox */}
                        <Controller
                            name="isPersonalBest"
                            control={form.control}
                            render={({ field: { onChange, value, ref }, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldContent>
                                        <div className="flex items-start gap-2">
                                            <Checkbox
                                                ref={ref}
                                                checked={value as boolean ?? false}
                                                onCheckedChange={onChange}
                                                id="form-rhf-demo-isPersonalBest"
                                                aria-invalid={fieldState.invalid}
                                                className="mt-1"
                                            />
                                            <div>
                                                <FieldLabel htmlFor="form-rhf-demo-isPersonalBest">
                                                    Personal Best 🏆
                                                </FieldLabel>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Mark this as your best performance for this exercise
                                                </p>
                                            </div>
                                        </div>
                                    </FieldContent>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <Field orientation="horizontal" className="justify-between mb-1 mt-6">
                        {!isEditing && (
                            <Button type="button" variant="outline" className="py-4.5" onClick={() => form.reset(EMPTY_DEFAULTS)}>
                                Reset
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn("cursor-pointer py-4.5", isEditing && "w-full")}
                            form="form-rhf-demo"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" />
                                    {isEditing ? "Updating..." : "Saving..."}
                                </div>
                            ) : isEditing ? "Update Workout ✏️" : "Save Workout 💪"}
                        </Button>
                    </Field>
                </form>
            </CardContent>
            {!isEditing && (
                <CardFooter>
                    <CardDescription className="text-[10px] md:text-xs font-semibold text-muted-foreground italic text-center">
                        "Strength does not come from what you can do. It comes from overcoming the things you once thought you couldn't."
                    </CardDescription>
                </CardFooter>
            )}
        </Card>
    )
}

export default WorkoutLogForm