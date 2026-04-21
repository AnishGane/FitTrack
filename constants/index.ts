import { LayoutDashboard, Dumbbell, Target, History } from "lucide-react";

export const MUSCLE_GROUPS = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "full_body", label: "Full Body" },
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

export const HISTORY_MUSCLE_GROUPS = [
  { value: "all", label: "All Groups" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "full_body", label: "Full Body" },
];

export const MUSCLE_COLORS: Record<string, string> = {
  chest: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  back: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  legs: "bg-green-500/15 text-green-400 border-green-500/30",
  shoulders: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  arms: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  core: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  cardio: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  full_body: "bg-red-500/15 text-red-400 border-red-500/30",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-green-500",
  intermediate: "text-yellow-500",
  advanced: "text-red-500",
};

export const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Workout Log", url: "/workout", icon: Dumbbell },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "History", url: "/history", icon: History },
];

export const TABS = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "full_body", label: "Full Body" },
] as const;
