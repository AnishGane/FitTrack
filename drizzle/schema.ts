import { pgTable, index, text, timestamp, unique, boolean, foreignKey, uuid, integer, real, varchar, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const difficulty = pgEnum("difficulty", ['beginner', 'intermediate', 'advanced'])
export const goalType = pgEnum("goal_type", ['weekly_workouts', 'weekly_duration', 'monthly_workouts', 'monthly_duration'])
export const muscleGroup = pgEnum("muscle_group", ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body'])


export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const workoutLogs = pgTable("workout_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	exerciseName: text("exercise_name").notNull(),
	muscleGroup: muscleGroup("muscle_group").notNull(),
	difficulty: difficulty().notNull(),
	sets: integer(),
	reps: integer(),
	weightKg: real("weight_kg"),
	durationMin: integer("duration_min"),
	distanceKm: real("distance_km"),
	caloriesBurned: integer("calories_burned"),
	notes: text(),
	isPersonalBest: boolean("is_personal_best").default(false),
	loggedAt: timestamp("logged_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "workout_logs_user_id_user_id_fk"
		}),
]);

export const goals = pgTable("goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	goalType: goalType("goal_type").default('weekly_workouts').notNull(),
	targetValue: integer("target_value").default(3).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "goals_user_id_user_id_fk"
		}),
]);

export const workoutTemplates = pgTable("workout_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	muscleGroup: muscleGroup("muscle_group").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	difficulty: difficulty().notNull(),
	defaultSets: integer("default_sets"),
	defaultReps: integer("default_reps"),
	defaultWeightKg: real("default_weight_kg"),
	defaultDurationMin: integer("default_duration_min"),
	defaultDistanceKm: real("default_distance_km"),
	defaultCaloriesBurned: integer("default_calories_burned"),
	useCount: integer("use_count").default(0).notNull(),
});

export const savedWorkouts = pgTable("saved_workouts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 300 }),
	muscleGroup: varchar("muscle_group", { length: 50 }).notNull(),
	difficulty: varchar({ length: 20 }).notNull(),
	sets: integer(),
	reps: integer(),
	weightKg: real("weight_kg"),
	durationMin: integer("duration_min"),
	distanceKm: real("distance_km"),
	caloriesBurned: integer("calories_burned"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "saved_workouts_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const userTemplateUsage = pgTable("user_template_usage", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	templateId: text("template_id").notNull(),
	useCount: integer("use_count").default(1).notNull(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_template_usage_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("user_template_usage_user_id_template_id_unique").on(table.userId, table.templateId),
]);
