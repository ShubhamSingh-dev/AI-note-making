import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Sidebar from "@/components/layout/Sidebar";
import NotesView from "@/components/notes/NotesView";
import AIView from "@/components/ai/AIView";
import SearchView from "@/components/notes/SearchView";

interface DashboardPageProps {
  view: "notes" | "ai" | "search";
}

const viewVariants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
} as const;

export default function DashboardPage({ view }: DashboardPageProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Ensure dark class is set on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div
      className="flex w-full h-screen overflow-hidden bg-[radial-gradient(ellipse_70%_60%_at_5%_0%,rgba(20,184,166,.04)_0%,transparent_55%),radial-gradient(ellipse_50%_50%_at_95%_100%,rgba(99,102,241,.03)_0%,transparent_55%),#f8fafc] dark:bg-[radial-gradient(ellipse_70%_60%_at_5%_0%,rgba(20,184,166,.06)_0%,transparent_55%),radial-gradient(ellipse_50%_50%_at_95%_100%,rgba(99,102,241,.05)_0%,transparent_55%),#07090f]"
    >
      <Sidebar
        view={view}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            variants={viewVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="flex-1 flex flex-col overflow-hidden"
          >
            {view === "notes" && <NotesView />}
            {view === "ai" && <AIView />}
            {view === "search" && <SearchView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
