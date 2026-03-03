import { z } from "zod";

// Zod schema for validating note creation input
export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).trim(),
  content: z.string().min(1, "Content is required").trim(),
}).strict();

// Zod schema for validating note update input
export const updateNoteSchema = z.object({
  title: z.string().min(1).max(100).trim().optional(),
  content: z.string().min(1).trim().optional(),
  isCompleted: z.boolean().optional(),
}).strict();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;