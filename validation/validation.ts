import { z } from "zod";

export const WorkoutLogSchema = z
  .object({
    exerciseName: z
      .string()
      .min(2, "Exercise name must be at least 2 characters")
      .max(50, "Exercise name must be at most 50 characters"),

    muscleGroup: z.enum(
      [
        "chest",
        "back",
        "shoulders",
        "arms",
        "cardio",
        "legs",
        "core",
        "full_body",
      ],
      { message: "Please select a muscle group" },
    ),

    difficulty: z.enum(["beginner", "intermediate", "advanced"], {
      message: "Please select a difficulty",
    }),

    sets: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce
        .number({ error: "Please enter a valid number" })
        .int()
        .min(1, "Min 1")
        .max(100, "Max 100"),
    ),
    reps: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce
        .number({ error: "Please enter a valid number" })
        .int()
        .min(1, "Min 1")
        .max(10000, "Max 10,000"),
    ),
    weightKg: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce
        .number({ error: "Please enter a valid number" })
        .min(0, "Min 0kg")
        .max(250, "Max 250kg"),
    ),
    durationMin: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce
        .number({ error: "Please enter a valid number" })
        .int()
        .min(1, "Min 1 min")
        .max(600, "Max 600 mins"),
    ),
    distanceKm: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce
        .number({ error: "Please enter a valid number" })
        .min(0, "Min 0")
        .max(1000, "Max 1000km")
        .optional(),
    ),
    caloriesBurned: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce
        .number({ error: "Please enter a valid number" })
        .int()
        .min(0, "Min 0")
        .max(10000, "Max 10,000"),
    ),

    notes: z.string().max(500, "Max 500 characters"),
    isPersonalBest: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const isCardio = data.muscleGroup === "cardio";

    if (!isCardio) {
      if (!data.sets)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sets"],
          message: "Please enter number of sets",
        });
      if (!data.reps)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reps"],
          message: "Please enter number of reps",
        });
      if (!data.weightKg)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["weightKg"],
          message: "Please enter weight",
        });
    }
    if (isCardio) {
      if (data.distanceKm == null)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["distanceKm"],
          message: "Please enter distance",
        });
    }
  });

export type WorkoutLogFormValue = z.input<typeof WorkoutLogSchema>;
