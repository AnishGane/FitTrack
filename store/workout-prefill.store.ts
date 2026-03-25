import { create } from "zustand";

interface WorkoutPrefillState {
  exerciseName: string;
  muscleGroup: string;
  setPrefill: (exerciseName: string, muscleGroup: string) => void;
  clearPrefill: () => void;
}

export const useWorkoutPrefillStore = create<WorkoutPrefillState>((set) => ({
  exerciseName: "",
  muscleGroup: "",
  setPrefill: (exerciseName, muscleGroup) => set({ exerciseName, muscleGroup }),
  clearPrefill: () => set({ exerciseName: "", muscleGroup: "" }),
}));
