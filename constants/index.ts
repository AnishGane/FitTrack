export const MUSCLE_GROUPS = [
  { value: "chest", label: "Chest", emoji: "💪" },
  { value: "back", label: "Back", emoji: "🔙" },
  { value: "legs", label: "Legs", emoji: "🦵" },
  { value: "shoulders", label: "Shoulders", emoji: "🏋️" },
  { value: "arms", label: "Arms", emoji: "💪" },
  { value: "core", label: "Core", emoji: "🎯" },
  { value: "cardio", label: "Cardio", emoji: "🏃" },
  { value: "full_body", label: "Full Body", emoji: "⚡" },
] as const;

export const DIFFICULTIES = [
  { value: "beginner", label: "Beginner", color: "text-green-500" },
  { value: "intermediate", label: "Intermediate", color: "text-yellow-500" },
  { value: "advanced", label: "Advanced", color: "text-red-500" },
] as const;

// Which fields to show based on muscle group
// Cardio → show duration + distance, hide sets/reps
// Strength → show sets/reps/weight, hide distance
export const CARDIO_GROUPS = ["cardio"];
