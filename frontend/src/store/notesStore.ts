import { create } from "zustand";
import type { Note } from "@/schemas/note.schema";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

interface NotesStore {
  notes: Note[];
  addNote: (title: string, content: string) => void;
  updateNote: (
    id: string,
    title: string,
    content: string,
    isCompleted: boolean
  ) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  addNote: (title, content) =>
    set((state) => ({
      notes: [
        {
          id: uid(),
          title,
          content,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          userId: "local",
        },
        ...state.notes,
      ],
    })),
  updateNote: (id, title, content, isCompleted) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, title, content, isCompleted } : n
      ),
    })),
  deleteNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
}));
