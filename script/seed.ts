// scripts/seed.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  schema,
  workoutLogs,
  goals,
  workoutTemplates,
  personalBests,
  templateExercises,
  NewWorkoutLog,
} from "../db/schema";

import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const TEST_USER_ID = "kUCLoxoTxgeSxIE5OQKrIZaLHqrnywVD";

// HELPERS

/** Returns a Date object N days ago from today */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0); // 9am workout time
  return d;
}

/** Pick a random item from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// SEED FUNCTIONS

async function seedGoal() {
  console.log("🌱 Seeding goal...");

  await db.insert(goals).values({
    userId: TEST_USER_ID,
    goalType: "weekly_workouts",
    targetValue: 4,
  });

  console.log("✅ Goal seeded — 4 workouts per week");
}

async function seedWorkoutLogs() {
  console.log("🌱 Seeding workout logs...");

  const logs: NewWorkoutLog[] = [
    // Week 1 (most recent)
    {
      userId: TEST_USER_ID,
      exerciseName: "Bench Press",
      muscleGroup: "chest",
      difficulty: "intermediate",
      sets: 4,
      reps: 8,
      weightKg: 80,
      durationMin: 45,
      notes: "Felt strong today, increased weight by 2.5kg",
      isPersonalBest: true,
      loggedAt: daysAgo(1),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Pull-ups",
      muscleGroup: "back",
      difficulty: "intermediate",
      sets: 4,
      reps: 10,
      durationMin: 40,
      notes: "Added 5kg belt weight",
      isPersonalBest: false,
      loggedAt: daysAgo(2),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Squats",
      muscleGroup: "legs",
      difficulty: "intermediate",
      sets: 5,
      reps: 5,
      weightKg: 100,
      durationMin: 55,
      notes: "New squat PR!",
      isPersonalBest: true,
      loggedAt: daysAgo(3),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Overhead Press",
      muscleGroup: "shoulders",
      difficulty: "intermediate",
      sets: 4,
      reps: 8,
      weightKg: 55,
      durationMin: 40,
      loggedAt: daysAgo(5),
    },

    // Week 2 
    {
      userId: TEST_USER_ID,
      exerciseName: "Incline Bench Press",
      muscleGroup: "chest",
      difficulty: "intermediate",
      sets: 4,
      reps: 10,
      weightKg: 70,
      durationMin: 45,
      loggedAt: daysAgo(7),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Barbell Row",
      muscleGroup: "back",
      difficulty: "intermediate",
      sets: 4,
      reps: 8,
      weightKg: 75,
      durationMin: 40,
      loggedAt: daysAgo(8),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Running",
      muscleGroup: "cardio",
      difficulty: "beginner",
      durationMin: 30,
      distanceKm: 5,
      caloriesBurned: 320,
      notes: "5k morning run",
      loggedAt: daysAgo(9),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Romanian Deadlift",
      muscleGroup: "legs",
      difficulty: "intermediate",
      sets: 4,
      reps: 10,
      weightKg: 80,
      durationMin: 40,
      loggedAt: daysAgo(11),
    },

    // Week 3
    {
      userId: TEST_USER_ID,
      exerciseName: "Push-ups",
      muscleGroup: "chest",
      difficulty: "beginner",
      sets: 4,
      reps: 20,
      durationMin: 20,
      loggedAt: daysAgo(14),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Lat Pulldown",
      muscleGroup: "back",
      difficulty: "beginner",
      sets: 3,
      reps: 12,
      weightKg: 60,
      durationMin: 35,
      loggedAt: daysAgo(15),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Lateral Raises",
      muscleGroup: "shoulders",
      difficulty: "beginner",
      sets: 3,
      reps: 15,
      weightKg: 10,
      durationMin: 25,
      loggedAt: daysAgo(16),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Plank",
      muscleGroup: "core",
      difficulty: "beginner",
      sets: 3,
      durationMin: 15,
      notes: "3 x 60 second holds",
      loggedAt: daysAgo(17),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Cycling",
      muscleGroup: "cardio",
      difficulty: "beginner",
      durationMin: 45,
      distanceKm: 15,
      caloriesBurned: 400,
      loggedAt: daysAgo(18),
    },

    // Week 4
    {
      userId: TEST_USER_ID,
      exerciseName: "Deadlift",
      muscleGroup: "back",
      difficulty: "advanced",
      sets: 5,
      reps: 3,
      weightKg: 140,
      durationMin: 60,
      notes: "Heavy day — form felt solid",
      isPersonalBest: true,
      loggedAt: daysAgo(21),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Leg Press",
      muscleGroup: "legs",
      difficulty: "intermediate",
      sets: 4,
      reps: 12,
      weightKg: 120,
      durationMin: 35,
      loggedAt: daysAgo(22),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Bicep Curls",
      muscleGroup: "arms",
      difficulty: "beginner",
      sets: 3,
      reps: 12,
      weightKg: 15,
      durationMin: 20,
      loggedAt: daysAgo(23),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Tricep Dips",
      muscleGroup: "arms",
      difficulty: "beginner",
      sets: 3,
      reps: 15,
      durationMin: 20,
      loggedAt: daysAgo(24),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Russian Twists",
      muscleGroup: "core",
      difficulty: "beginner",
      sets: 3,
      reps: 20,
      weightKg: 10,
      durationMin: 15,
      loggedAt: daysAgo(25),
    },
  ];

  await db.insert(workoutLogs).values(logs);
  console.log(`✅ ${logs.length} workout logs seeded`);
}

async function seedWorkoutTemplates() {
  console.log("🌱 Seeding workout templates...");

  // Insert templates first, get back their IDs
  const [pushDay] = await db
    .insert(workoutTemplates)
    .values({
      userId: TEST_USER_ID,
      name: "Push Day A",
      description: "Chest, shoulders, triceps — heavy compound focus",
      muscleGroup: "chest",
      isPublic: false,
    })
    .returning({ id: workoutTemplates.id });

  const [pullDay] = await db
    .insert(workoutTemplates)
    .values({
      userId: TEST_USER_ID,
      name: "Pull Day A",
      description: "Back and biceps — vertical and horizontal pulls",
      muscleGroup: "back",
      isPublic: false,
    })
    .returning({ id: workoutTemplates.id });

  const [legDay] = await db
    .insert(workoutTemplates)
    .values({
      userId: TEST_USER_ID,
      name: "Leg Day",
      description: "Full lower body — quads, hamstrings, glutes",
      muscleGroup: "legs",
      isPublic: false,
    })
    .returning({ id: workoutTemplates.id });

  console.log("✅ 3 templates created");

  // Template Exercises
  console.log("🌱 Seeding template exercises...");

  await db.insert(templateExercises).values([
    // Push Day exercises
    {
      templateId: pushDay.id,
      exerciseName: "Bench Press",
      muscleGroup: "chest",
      difficulty: "intermediate",
      defaultSets: 4,
      defaultReps: 8,
      defaultWeightKg: 80,
      orderIndex: 0,
    },
    {
      templateId: pushDay.id,
      exerciseName: "Incline Press",
      muscleGroup: "chest",
      difficulty: "intermediate",
      defaultSets: 3,
      defaultReps: 10,
      defaultWeightKg: 65,
      orderIndex: 1,
    },
    {
      templateId: pushDay.id,
      exerciseName: "Overhead Press",
      muscleGroup: "shoulders",
      difficulty: "intermediate",
      defaultSets: 3,
      defaultReps: 8,
      defaultWeightKg: 50,
      orderIndex: 2,
    },
    {
      templateId: pushDay.id,
      exerciseName: "Lateral Raises",
      muscleGroup: "shoulders",
      difficulty: "beginner",
      defaultSets: 3,
      defaultReps: 15,
      defaultWeightKg: 10,
      orderIndex: 3,
    },
    {
      templateId: pushDay.id,
      exerciseName: "Tricep Dips",
      muscleGroup: "arms",
      difficulty: "beginner",
      defaultSets: 3,
      defaultReps: 12,
      orderIndex: 4,
    },

    // Pull Day exercises
    {
      templateId: pullDay.id,
      exerciseName: "Deadlift",
      muscleGroup: "back",
      difficulty: "advanced",
      defaultSets: 5,
      defaultReps: 3,
      defaultWeightKg: 140,
      orderIndex: 0,
    },
    {
      templateId: pullDay.id,
      exerciseName: "Pull-ups",
      muscleGroup: "back",
      difficulty: "intermediate",
      defaultSets: 4,
      defaultReps: 8,
      orderIndex: 1,
    },
    {
      templateId: pullDay.id,
      exerciseName: "Barbell Row",
      muscleGroup: "back",
      difficulty: "intermediate",
      defaultSets: 4,
      defaultReps: 8,
      defaultWeightKg: 70,
      orderIndex: 2,
    },
    {
      templateId: pullDay.id,
      exerciseName: "Lat Pulldown",
      muscleGroup: "back",
      difficulty: "beginner",
      defaultSets: 3,
      defaultReps: 12,
      defaultWeightKg: 60,
      orderIndex: 3,
    },
    {
      templateId: pullDay.id,
      exerciseName: "Bicep Curls",
      muscleGroup: "arms",
      difficulty: "beginner",
      defaultSets: 3,
      defaultReps: 12,
      defaultWeightKg: 15,
      orderIndex: 4,
    },

    // Leg Day exercises
    {
      templateId: legDay.id,
      exerciseName: "Squats",
      muscleGroup: "legs",
      difficulty: "intermediate",
      defaultSets: 5,
      defaultReps: 5,
      defaultWeightKg: 100,
      orderIndex: 0,
    },
    {
      templateId: legDay.id,
      exerciseName: "Romanian Deadlift",
      muscleGroup: "legs",
      difficulty: "intermediate",
      defaultSets: 4,
      defaultReps: 10,
      defaultWeightKg: 80,
      orderIndex: 1,
    },
    {
      templateId: legDay.id,
      exerciseName: "Leg Press",
      muscleGroup: "legs",
      difficulty: "intermediate",
      defaultSets: 4,
      defaultReps: 12,
      defaultWeightKg: 120,
      orderIndex: 2,
    },
    {
      templateId: legDay.id,
      exerciseName: "Lunges",
      muscleGroup: "legs",
      difficulty: "beginner",
      defaultSets: 3,
      defaultReps: 12,
      defaultWeightKg: 20,
      orderIndex: 3,
    },
    {
      templateId: legDay.id,
      exerciseName: "Leg Raises",
      muscleGroup: "core",
      difficulty: "beginner",
      defaultSets: 3,
      defaultReps: 15,
      orderIndex: 4,
    },
  ]);

  console.log("✅ 15 template exercises seeded");
}

async function seedPersonalBests() {
  console.log("🌱 Seeding personal bests...");

  await db.insert(personalBests).values([
    {
      userId: TEST_USER_ID,
      exerciseName: "Bench Press",
      muscleGroup: "chest",
      bestWeightKg: 80,
      bestReps: 8,
      achievedAt: daysAgo(1),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Squats",
      muscleGroup: "legs",
      bestWeightKg: 100,
      bestReps: 5,
      achievedAt: daysAgo(3),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Deadlift",
      muscleGroup: "back",
      bestWeightKg: 140,
      bestReps: 3,
      achievedAt: daysAgo(21),
    },
    {
      userId: TEST_USER_ID,
      exerciseName: "Running",
      muscleGroup: "cardio",
      bestDurationMin: 30,
      bestDistanceKm: 5,
      achievedAt: daysAgo(9),
    },
  ]);

  console.log("✅ 4 personal bests seeded");
}

// MAIN — runs all seed functions in order

async function main() {
  console.log("🚀 Starting seed...\n");

  if (TEST_USER_ID != "kUCLoxoTxgeSxIE5OQKrIZaLHqrnywVD") {
    console.error("❌ ERROR: You forgot to set TEST_USER_ID in seed.ts!");
    console.error("   Run this in Drizzle Studio or Neon Console:");
    console.error('   SELECT id, email FROM "user" LIMIT 5;');
    process.exit(1);
  }

  try {
    await seedGoal();
    await seedWorkoutLogs();
    await seedWorkoutTemplates();
    await seedPersonalBests();

    console.log("\n✅ All seed data inserted successfully!");
    console.log("   Open Drizzle Studio to verify: npx drizzle-kit studio");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
