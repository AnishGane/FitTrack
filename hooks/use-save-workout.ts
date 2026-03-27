"use client";
import {
  saveWorkoutFromLogAction,
  unsaveWorkoutLogAction,
} from "@/actions/common/common.action";
import { useSavedWorkoutsStore } from "@/store/saved-workouts.store";
import { toast } from "sonner";

export const useSaveWorkout = () => {
  const { setSaving, setSaved, setIdle, setUnsaving, getStatus } =
    useSavedWorkoutsStore();

  async function handleSaveWorkout(logId: string) {
    const current = getStatus(logId);

    if (current.status === "saved" && current.savedId) {
      // Unsave
      setUnsaving(logId);
      const response = await unsaveWorkoutLogAction(current.savedId);
      if (response.success) {
        toast.success(response.message);
        setIdle(logId);
      } else {
        toast.error(response.message);
        setSaved(logId, current.savedId); // restore if failed
      }
    } else {
      //  Save
      setSaving(logId);
      const response = await saveWorkoutFromLogAction(logId);
      if (response.success) {
        toast.success(response.message);
        setSaved(logId, response.savedId!);
      } else {
        toast.error(response.message);
        setIdle(logId);
      }
    }
  }

  return { handleSaveWorkout, getStatus };
};
