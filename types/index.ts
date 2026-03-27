export type ActionResult =
  | { success: true; message: string; savedId?: string }
  | { success: false; message: string };
