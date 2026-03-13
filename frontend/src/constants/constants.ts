export const backendUrl = import.meta.env.VITE_BACKEND_URL;

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