import { relations } from "drizzle-orm/relations";
import { user, account, session, workoutLogs, goals, savedWorkouts, userTemplateUsage } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	workoutLogs: many(workoutLogs),
	goals: many(goals),
	savedWorkouts: many(savedWorkouts),
	userTemplateUsages: many(userTemplateUsage),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const workoutLogsRelations = relations(workoutLogs, ({one}) => ({
	user: one(user, {
		fields: [workoutLogs.userId],
		references: [user.id]
	}),
}));

export const goalsRelations = relations(goals, ({one}) => ({
	user: one(user, {
		fields: [goals.userId],
		references: [user.id]
	}),
}));

export const savedWorkoutsRelations = relations(savedWorkouts, ({one}) => ({
	user: one(user, {
		fields: [savedWorkouts.userId],
		references: [user.id]
	}),
}));

export const userTemplateUsageRelations = relations(userTemplateUsage, ({one}) => ({
	user: one(user, {
		fields: [userTemplateUsage.userId],
		references: [user.id]
	}),
}));