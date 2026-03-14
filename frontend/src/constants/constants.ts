export const backendUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

export const passwordRules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
];

export const ACCENTS = [
  "bg-linear-to-r from-teal-500 to-teal-600",
  "bg-linear-to-r from-indigo-500 to-violet-500",
  "bg-linear-to-r from-amber-500 to-red-500",
  "bg-linear-to-r from-pink-500 to-rose-500",
  "bg-linear-to-r from-green-500 to-emerald-500",
  "bg-linear-to-r from-blue-500 to-indigo-500",
];

export const QUICK_PROMPTS = [
  { emoji: "📋", label: "List all notes", prompt: "Show all my notes" },
  {
    emoji: "✏️",
    label: "Create a note",
    prompt: "Create a note titled Shopping List with milk, eggs, bread",
  },
  { emoji: "🔍", label: "Search notes", prompt: "Search my notes for meeting" },
  { emoji: "✨", label: "Summarize note", prompt: "Summarize my latest note" },
];
