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
  initial: { opacity: 0, y: 8 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

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
      className="flex w-full h-screen overflow-hidden"
      style={{
        background: isDark
          ? "radial-gradient(ellipse 70% 60% at 5% 0%, rgba(20,184,166,.06) 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 95% 100%, rgba(99,102,241,.05) 0%, transparent 55%), #07090f"
          : "radial-gradient(ellipse 70% 60% at 5% 0%, rgba(20,184,166,.04) 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 95% 100%, rgba(99,102,241,.03) 0%, transparent 55%), #f8fafc",
      }}
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
