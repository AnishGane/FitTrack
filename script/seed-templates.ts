import { NewWorkoutTemplate, workoutTemplates } from "@/db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "../db/schema";

import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const templates = [
  // ── CHEST ──────────────────────────────────────────────────
  {
    name: "Barbell Bench Press",
    muscleGroup: "chest",
    difficulty: "intermediate",
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 80,
    defaultDurationMin: 30,
    defaultCaloriesBurned: 200,
  },
  {
    name: "Incline Dumbbell Press",
    muscleGroup: "chest",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 30,
    defaultDurationMin: 25,
    defaultCaloriesBurned: 160,
  },
  {
    name: "Push Ups",
    muscleGroup: "chest",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: null,
    defaultDurationMin: 15,
    defaultCaloriesBurned: 100,
  },
  {
    name: "Cable Fly",
    muscleGroup: "chest",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 15,
    defaultDurationMin: 20,
    defaultCaloriesBurned: 130,
  },

  // ── BACK ───────────────────────────────────────────────────
  {
    name: "Deadlift",
    muscleGroup: "back",
    difficulty: "advanced",
    defaultSets: 4,
    defaultReps: 5,
    defaultWeightKg: 120,
    defaultDurationMin: 35,
    defaultCaloriesBurned: 280,
  },
  {
    name: "Pull Ups",
    muscleGroup: "back",
    difficulty: "intermediate",
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: null,
    defaultDurationMin: 20,
    defaultCaloriesBurned: 150,
  },
  {
    name: "Barbell Row",
    muscleGroup: "back",
    difficulty: "intermediate",
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 70,
    defaultDurationMin: 25,
    defaultCaloriesBurned: 200,
  },
  {
    name: "Lat Pulldown",
    muscleGroup: "back",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 50,
    defaultDurationMin: 20,
    defaultCaloriesBurned: 140,
  },

  // ── LEGS ───────────────────────────────────────────────────
  {
    name: "Barbell Squat",
    muscleGroup: "legs",
    difficulty: "advanced",
    defaultSets: 4,
    defaultReps: 6,
    defaultWeightKg: 100,
    defaultDurationMin: 40,
    defaultCaloriesBurned: 300,
  },
  {
    name: "Romanian Deadlift",
    muscleGroup: "legs",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 70,
    defaultDurationMin: 25,
    defaultCaloriesBurned: 200,
  },
  {
    name: "Leg Press",
    muscleGroup: "legs",
    difficulty: "beginner",
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 120,
    defaultDurationMin: 25,
    defaultCaloriesBurned: 180,
  },
  {
    name: "Walking Lunges",
    muscleGroup: "legs",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 20,
    defaultWeightKg: 20,
    defaultDurationMin: 20,
    defaultCaloriesBurned: 160,
  },

  // ── SHOULDERS ──────────────────────────────────────────────
  {
    name: "Overhead Press",
    muscleGroup: "shoulders",
    difficulty: "intermediate",
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 50,
    defaultDurationMin: 30,
    defaultCaloriesBurned: 180,
  },
  {
    name: "Lateral Raises",
    muscleGroup: "shoulders",
    difficulty: "beginner",
    defaultSets: 4,
    defaultReps: 15,
    defaultWeightKg: 10,
    defaultDurationMin: 15,
    defaultCaloriesBurned: 100,
  },
  {
    name: "Face Pulls",
    muscleGroup: "shoulders",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 15,
    defaultDurationMin: 15,
    defaultCaloriesBurned: 90,
  },

  // ── ARMS ───────────────────────────────────────────────────
  {
    name: "Barbell Curl",
    muscleGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 30,
    defaultDurationMin: 15,
    defaultCaloriesBurned: 100,
  },
  {
    name: "Skull Crushers",
    muscleGroup: "arms",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 25,
    defaultDurationMin: 20,
    defaultCaloriesBurned: 110,
  },
  {
    name: "Hammer Curls",
    muscleGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 15,
    defaultDurationMin: 15,
    defaultCaloriesBurned: 90,
  },

  // ── CORE ───────────────────────────────────────────────────
  {
    name: "Plank",
    muscleGroup: "core",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: null,
    defaultWeightKg: null,
    defaultDurationMin: 10,
    defaultCaloriesBurned: 60,
  },
  {
    name: "Cable Crunch",
    muscleGroup: "core",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 20,
    defaultDurationMin: 15,
    defaultCaloriesBurned: 80,
  },
  {
    name: "Hanging Leg Raise",
    muscleGroup: "core",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: null,
    defaultDurationMin: 15,
    defaultCaloriesBurned: 90,
  },

  // ── CARDIO ─────────────────────────────────────────────────
  {
    name: "Treadmill Run",
    muscleGroup: "cardio",
    difficulty: "beginner",
    defaultSets: null,
    defaultReps: null,
    defaultWeightKg: null,
    defaultDurationMin: 30,
    defaultDistanceKm: 5,
    defaultCaloriesBurned: 300,
  },
  {
    name: "Cycling",
    muscleGroup: "cardio",
    difficulty: "beginner",
    defaultSets: null,
    defaultReps: null,
    defaultWeightKg: null,
    defaultDurationMin: 45,
    defaultDistanceKm: 15,
    defaultCaloriesBurned: 400,
  },
  {
    name: "Jump Rope",
    muscleGroup: "cardio",
    difficulty: "intermediate",
    defaultSets: 5,
    defaultReps: null,
    defaultWeightKg: null,
    defaultDurationMin: 20,
    defaultDistanceKm: null,
    defaultCaloriesBurned: 250,
  },
  {
    name: "Rowing Machine",
    muscleGroup: "cardio",
    difficulty: "intermediate",
    defaultSets: null,
    defaultReps: null,
    defaultWeightKg: null,
    defaultDurationMin: 30,
    defaultDistanceKm: 6,
    defaultCaloriesBurned: 280,
  },
  {
    name: "Stair Climber",
    muscleGroup: "cardio",
    difficulty: "intermediate",
    defaultSets: null,
    defaultReps: null,
    defaultWeightKg: null,
    defaultDurationMin: 25,
    defaultDistanceKm: null,
    defaultCaloriesBurned: 260,
  },

  // ── FULL BODY ──────────────────────────────────────────────
  {
    name: "Burpees",
    muscleGroup: "full_body",
    difficulty: "intermediate",
    defaultSets: 4,
    defaultReps: 15,
    defaultWeightKg: null,
    defaultDurationMin: 20,
    defaultCaloriesBurned: 250,
  },
  {
    name: "Kettlebell Swing",
    muscleGroup: "full_body",
    difficulty: "intermediate",
    defaultSets: 4,
    defaultReps: 15,
    defaultWeightKg: 24,
    defaultDurationMin: 20,
    defaultCaloriesBurned: 200,
  },
  {
    name: "Turkish Get Up",
    muscleGroup: "full_body",
    difficulty: "advanced",
    defaultSets: 3,
    defaultReps: 5,
    defaultWeightKg: 16,
    defaultDurationMin: 25,
    defaultCaloriesBurned: 180,
  },
  {
    name: "Battle Ropes",
    muscleGroup: "full_body",
    difficulty: "intermediate",
    defaultSets: 5,
    defaultReps: null,
    defaultWeightKg: null,
    defaultDurationMin: 20,
    defaultCaloriesBurned: 300,
  },
  {
    name: "Box Jumps",
    muscleGroup: "full_body",
    difficulty: "intermediate",
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: null,
    defaultDurationMin: 20,
    defaultCaloriesBurned: 220,
  },
];

async function seedTemplates() {
  console.log(" Seeding workout templates...");

  const formatted: NewWorkoutTemplate[] = templates.map((t) => ({
    name: t.name,
    muscleGroup: t.muscleGroup as any,
    difficulty: t.difficulty as any,
    defaultSets: t.defaultSets ?? null,
    defaultReps: t.defaultReps ?? null,
    defaultWeightKg: t.defaultWeightKg ?? null,
    defaultDurationMin: t.defaultDurationMin ?? null,
    defaultCaloriesBurned: t.defaultCaloriesBurned ?? null,
    defaultDistanceKm:
      ("defaultDistanceKm" in t ? t.defaultDistanceKm : null) ?? null,
  }));

  await db.insert(workoutTemplates).values(formatted);
  console.log(`Seeded ${templates.length} workout templates`);
  process.exit(0);
}

seedTemplates().catch((err) => {
  console.error(" Seed failed:", err);
  process.exit(1);
});
