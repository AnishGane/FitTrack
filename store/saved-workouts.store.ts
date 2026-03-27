import { create } from "zustand";

interface SavedWorkoutsState {
  // Record<logId, { status, savedId }>
  saveStatus: Record<
    string,
    { status: "idle" | "saving" | "saved" | "unsaving"; savedId?: string }
  >;

  // Actions
  setSaving: (logId: string) => void;
  setSaved: (logId: string, savedId: string) => void;
  setIdle: (logId: string) => void;
  setUnsaving: (logid: string) => void;
  getStatus: (logId: string) => {
    status: "idle" | "saving" | "saved" | "unsaving";
    savedId?: string;
  };
}

export const useSavedWorkoutsStore = create<SavedWorkoutsState>((set, get) => ({
  saveStatus: {},

  setSaving: (logId) =>
    set((prev) => ({
      saveStatus: { ...prev.saveStatus, [logId]: { status: "saving" } },
    })),

  setSaved: (logId, savedId) =>
    set((prev) => ({
      saveStatus: { ...prev.saveStatus, [logId]: { status: "saved", savedId } },
    })),

  setIdle: (logId) =>
    set((prev) => ({
      saveStatus: { ...prev.saveStatus, [logId]: { status: "idle" } },
    })),

  setUnsaving: (logId) =>
    set((prev) => ({
      saveStatus: { ...prev.saveStatus, [logId]: { status: "unsaving" } },
    })),

  getStatus: (logId) => get().saveStatus[logId] ?? { status: "idle" },
}));
