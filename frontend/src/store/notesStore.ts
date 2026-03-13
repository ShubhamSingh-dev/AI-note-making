import { create } from "zustand";
import type { Note } from "@/schemas/note.schema";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const DEMO_NOTES: Note[] = [
  {
    id: "1",
    title: "Weekly Goals",
    content:
      "1. Finish the backend API\n2. Set up CI/CD pipeline\n3. Review pull requests from the team\n4. Write unit tests for the auth module\n5. Deploy staging environment",
    isCompleted: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "2",
    title: "Meeting Notes — Product Sync",
    content:
      "Attendees: Alex, Jamie, Priya\n\nKey decisions:\n- Launch MVP by end of Q2\n- Prioritize mobile-first design\n- Defer analytics dashboard to v2\n\nAction items:\n- Alex: Finalize API contract\n- Jamie: Figma mockups\n- Priya: Set up staging env",
    isCompleted: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "3",
    title: "Book List 2025",
    content:
      "Currently reading:\n- The Pragmatic Programmer\n- Designing Data-Intensive Applications\n\nWant to read:\n- Clean Code\n- System Design Interview\n- The Art of Doing Science and Engineering",
    isCompleted: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "4",
    title: "Grocery List",
    content:
      "Vegetables: spinach, broccoli, carrots\nFruits: bananas, apples, blueberries\nDairy: milk, yoghurt, cheese\nOther: oats, olive oil, pasta, tomato sauce",
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "5",
    title: "Side Project Ideas",
    content:
      "1. AI-powered code reviewer Chrome extension\n2. Terminal-based habit tracker\n3. Open-source Notion alternative\n4. RSS reader with AI summaries\n5. Personal finance tracker with charts",
    isCompleted: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "6",
    title: "Learning TypeScript",
    content:
      "Key concepts:\n- Generics and utility types\n- Discriminated unions\n- Declaration merging\n- Module augmentation\n- Conditional types\n\nResources:\n- typescript-exercises.github.io\n- Total TypeScript by Matt Pocock",
    isCompleted: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

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
  notes: DEMO_NOTES,
  addNote: (title, content) =>
    set((state) => ({
      notes: [
        {
          id: uid(),
          title,
          content,
          isCompleted: false,
          createdAt: new Date().toISOString(),
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
