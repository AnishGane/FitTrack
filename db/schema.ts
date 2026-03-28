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
  varchar,
  unique,
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WORKOUT TEMPLATES (future-proof)
// Lets users save a workout routine they can reuse
export const workoutTemplates = pgTable("workout_templates", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(), // "Barbell Bench Press"
  muscleGroup: muscleGroupEnum("muscle_group").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),

  // ── Defaults (pre-filled in form) ───────────────────────────
  defaultSets: integer("default_sets"),
  defaultReps: integer("default_reps"),
  defaultWeightKg: real("default_weight_kg"),
  defaultDurationMin: integer("default_duration_min"),
  defaultDistanceKm: real("default_distance_km"),
  defaultCaloriesBurned: integer("default_calories_burned"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved workouts
export const savedWorkouts = pgTable("saved_workouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 100 }).notNull(), // "Push Day A", "Morning Run"
  description: varchar("description", { length: 300 }), // optional notes about the template

  muscleGroup: varchar("muscle_group", { length: 50 }).notNull(), // same enum as workoutLogs
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // beginner | intermediate | advanced

  sets: integer("sets"),
  reps: integer("reps"),
  weightKg: real("weight_kg"),

  durationMin: integer("duration_min"),
  distanceKm: real("distance_km"),
  caloriesBurned: integer("calories_burned"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// track the count usage for the workout templates
export const userTemplateUsage = pgTable(
  "user_template_usage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: "cascade" }),
    useCount: integer("use_count").default(1).notNull(),
    lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
  },
  (table) => ({
    userTemplateUnique: unique().on(table.userId, table.templateId),
  }),
);

// TYPESCRIPT TYPES
// Inferred directly from schema — always stay in sync with DB

// Saved workouts
export type SavedWorkout = typeof savedWorkouts.$inferSelect;
export type NewSavedWorkout = typeof savedWorkouts.$inferInsert;

// Workout Logs
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type NewWorkoutLog = typeof workoutLogs.$inferInsert;

// Goals
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

// Templates
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type NewWorkoutTemplate = typeof workoutTemplates.$inferInsert;

export type UserTemplateUsage = typeof userTemplateUsage.$inferSelect;

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
  savedWorkouts,
};
