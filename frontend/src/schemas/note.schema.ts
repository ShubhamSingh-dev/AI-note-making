import { z } from "zod";

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  isCompleted: z.boolean(),
  createdAt: z.string(),
  userId: z.string(),
});

export type Note = z.infer<typeof noteSchema>;

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters")
    .trim(),
  content: z.string().min(1, "Content is required").trim(),
});

export type CreateNoteFormData = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters")
    .trim()
    .optional(),

  content: z.string().min(1, "Content is required").trim().optional(),

  isCompleted: z.boolean().optional(),
});

export type UpdateNoteFormData = z.infer<typeof updateNoteSchema>;
