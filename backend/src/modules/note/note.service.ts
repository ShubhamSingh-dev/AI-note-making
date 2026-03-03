import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { CreateNoteInput, UpdateNoteInput } from "./note.schema.js";

export const createNote = async (userId: string, data: CreateNoteInput) => {
  return await prisma.note.create({ data: { ...data, userId } });
};

export const getUserNotes = async (userId: string) => {
  return await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getNoteById = async (userId: string, noteId: string) => {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) throw new ApiError(404, "Note not found");
  if (note.userId !== userId) throw new ApiError(403, "Forbidden");
  return note;
};

export const searchNotesByContent = async (userId: string, query: string) => {
  return await prisma.note.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
  });
};

export const updateNote = async (
  userId: string,
  noteId: string,
  data: UpdateNoteInput
) => {
  await getNoteById(userId, noteId); // check ownership
  return await prisma.note.update({ where: { id: noteId }, data });
};

export const deleteNote = async (userId: string, noteId: string) => {
  await getNoteById(userId, noteId); // check ownership
  await prisma.note.delete({ where: { id: noteId } });
};
