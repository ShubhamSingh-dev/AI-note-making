import { groq } from "../../config/groq.js";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { CreateNoteInput, UpdateNoteInput } from "./note.schema.js";

export const createNote = async (userId: string, data: CreateNoteInput) => {
  return await prisma.note.create({ data: { ...data, userId } });
};

// Supports optional pagination via page + limit query params
export const getUserNotes = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [notes, total] = await prisma.$transaction([
    prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.note.count({ where: { userId } }),
  ]);

  return {
    notes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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
  return { success: true , noteId}
};

export const summarizeNote = async (userId: string, noteId: string) => {
  const note = await getNoteById(userId, noteId);
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Summarize the following note in 2-3 concise sentences:\n\nTitle: ${note.title}\n\nContent: ${note.content}`,
      },
    ],
  });

  return {
    noteId: note.id,
    title: note.title,
    summary: response.choices[0].message.content,
  };
};
