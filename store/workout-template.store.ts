// store/workout-template.store.ts
import { create } from "zustand";
import { WorkoutTemplate } from "@/db/schema";

interface WorkoutTemplateState {
  selectedTemplate: WorkoutTemplate | null;
  setTemplate:      (template: WorkoutTemplate) => void;
  clearTemplate:    () => void;
}

export const useWorkoutTemplateStore = create<WorkoutTemplateState>((set) => ({
  selectedTemplate: null,
  setTemplate:      (template) => set({ selectedTemplate: template }),
  clearTemplate:    () => set({ selectedTemplate: null }),
}));