import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  uuid,
  integer,
  real,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const muscleGroupEnum = pgEnum("muscle_group", [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "cardio",
  "full_body",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const goalTypeEnum = pgEnum("goal_type", [
  "weekly_workouts", // how many days per week to train
  "weekly_duration", // total minutes per week
  "monthly_workouts", // how many workouts per month
  "monthly_duration", // total minutes per month
]);

// WORKOUT LOGS
// Core table — every workout session a user logs goes here
export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),

  // Workout details
  exerciseName: text("exercise_name").notNull(),
  muscleGroup: muscleGroupEnum("muscle_group").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),

  // Performance metrics — all optional, user fills what's relevant
  sets: integer("sets"),
  reps: integer("reps"),
  weightKg: real("weight_kg"), // float like 102.5 Kg
  durationMin: integer("duration_min"), //for cardio/timed sets
  distanceKm: real("distance_km"), // for runs, cycling, etc
  caloriesBurned: integer("calories_burned"), // optional estimate

  // Extra
  notes: text("notes"), // free text, optional
  isPersonalBest: boolean("is_personal_best").default(false),

  // Timestamps
  loggedAt: timestamp("logged_at").defaultNow().notNull(), // when workout happened
  createdAt: timestamp("created_at").defaultNow().notNull(), // when record was created
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  goalType: goalTypeEnum("goal_type").notNull().default("weekly_workouts"),
  targetValue: integer("target_value").notNull().default(3),
  // meaning depends on goalType:
  // weekly_workouts  → 3 = "3 days per week"
  // weekly_duration  → 120 = "120 minutes per week"
  // monthly_workouts → 12 = "12 workouts per month"
  // monthly_duration → 1200 = "1200 minutes per month"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WORKOUT TEMPLATES (future-proof)
// Lets users save a workout routine they can reuse
// e.g. "Push Day A" with their favourite exercises
export const workoutTemplates = pgTable("workout_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),

  name: text("name").notNull(), // eg: Push Day A, Leg Day
  description: text("description"),
  muscleGroup: muscleGroupEnum("muscle_group"), // primary focus
  isPublic: boolean("is_public").default(false), // share with others later

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TEMPLATE EXERCISES (future-proof)
// Individual exercises that belong to a template
// Separate table so a template can have multiple exercises
export const templateExercises = pgTable("template_exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => workoutTemplates.id, { onDelete: "cascade" }),
  // cascade → if template deleted, its exercises auto-delete too

  exerciseName: text("exercise_name").notNull(),
  muscleGroup: muscleGroupEnum("muscle_group").notNull(),
  difficulty: difficultyEnum("difficulty"),

  // Default targets for this exercise in the template
  defaultSets: integer("default_sets"),
  defaultReps: integer("default_reps"),
  defaultWeightKg: real("default_weight_kg"),
  orderIndex: integer("order_index").notNull().default(0), // display order

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PERSONAL BESTS (future-proof)
// Tracks the best performance per exercise per user
// Updated automatically when isPersonalBest = true on a log
export const personalBests = pgTable("personal_bests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  exerciseName: text("exercise_name").notNull(),
  muscleGroup: muscleGroupEnum("muscle_group").notNull(),

  // Best values ever recorded
  bestWeightKg: real("best_weight_kg"),
  bestReps: integer("best_reps"),
  bestDurationMin: integer("best_duration_min"),
  bestDistanceKm: real("best_distance_km"),

  // Which log entry this PB came from
  workoutLogId: uuid("workout_log_id").references(() => workoutLogs.id, {
    onDelete: "set null",
  }),
  // set null → if log is deleted, PB record stays but loses reference

  achievedAt: timestamp("achieved_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TYPESCRIPT TYPES
// Inferred directly from schema — always stay in sync with DB

// Workout Logs
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type NewWorkoutLog = typeof workoutLogs.$inferInsert;

// Goals
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

// Templates
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type NewWorkoutTemplate = typeof workoutTemplates.$inferInsert;

export type TemplateExercise = typeof templateExercises.$inferSelect;
export type NewTemplateExercise = typeof templateExercises.$inferInsert;

// Personal Bests
export type PersonalBest = typeof personalBests.$inferSelect;
export type NewPersonalBest = typeof personalBests.$inferInsert;

// Enum value types — useful for typed dropdowns in forms
export type MuscleGroup = (typeof muscleGroupEnum.enumValues)[number];
export type Difficulty = (typeof difficultyEnum.enumValues)[number];
export type GoalType = (typeof goalTypeEnum.enumValues)[number];

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  workoutLogs,
  goals,
  workoutTemplates,
  templateExercises,
  personalBests,
};
