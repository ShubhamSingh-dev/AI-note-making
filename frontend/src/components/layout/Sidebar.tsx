import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/authStore";
import { useGetNotes } from "@/hooks/useNotes";
import { useLogout } from "@/hooks/useAuth";
import { useLayoutStore } from "@/store/layoutStore";
import { cn } from "@/lib/utils";
import {
  FileText,
  Zap,
  Search,
  LogOut,
  Sun,
  Moon,
  FileIcon,
} from "lucide-react";

const NAV = [
  { id: "notes", label: "All Notes", icon: FileText, path: "/notes" },
  { id: "ai", label: "AI Assistant", icon: Zap, path: "/ai", badge: "AI" },
  { id: "search", label: "Search", icon: Search, path: "/search" },
];

interface SidebarProps {
  view: string;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Sidebar({ view, isDark, onToggleTheme }: SidebarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { isMobileMenuOpen, setMobileMenuOpen } = useLayoutStore();

  const { data, isLoading } = useGetNotes(1, 20);
  const notes = data?.notes ?? [];
  const total = data?.total ?? 0;

  const SidebarContent = (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center shadow-md shadow-teal-500/30">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-syne font-bold text-[17px] text-zinc-900 dark:text-white tracking-tight">
            Notiq
          </span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-zinc-200 dark:hover:bg-white/8 transition-all"
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isDark ? "Switch to light mode" : "Switch to dark mode"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-hidden flex flex-col">
        <p className="px-3 pt-3 pb-1.5 text-[10px] font-syne font-bold uppercase tracking-[.12em] text-zinc-500 dark:text-zinc-600">
          Workspace
        </p>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all w-full text-left font-outfit",
                active
                  ? "text-teal-600 dark:text-teal-400 bg-teal-500/10"
                  : "text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>

              {/* Notes count badge */}
              {item.id === "notes" && (
                <span className="text-[10px] font-semibold bg-zinc-200 dark:bg-white/[.07] text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md font-syne">
                  {isLoading ? "…" : total}
                </span>
              )}

              {/* AI badge */}
              {item.badge && item.id !== "notes" && (
                <span className="text-[10px] font-semibold bg-teal-500/15 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded-md font-syne">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}

        {/* Recent notes */}
        <p className="px-3 pt-5 pb-1.5 text-[10px] font-syne font-bold uppercase tracking-[.12em] text-zinc-500 dark:text-zinc-600">
          Recent
        </p>
        <ScrollArea className="flex-1">
          <div className="space-y-0.5">
            {isLoading && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 rounded-[10px] bg-zinc-200 dark:bg-white/4 mx-1"
                  />
                ))}
              </>
            )}

            {!isLoading && notes.length === 0 && (
              <p className="px-3 py-2 text-[11.5px] text-zinc-500 dark:text-zinc-600 font-outfit italic">
                No notes yet
              </p>
            )}

            {!isLoading &&
              notes.slice(0, 5).map((n: any) => (
                <button
                  key={n.id}
                  onClick={() => {
                    navigate("/notes");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[12.5px] font-medium transition-all w-full text-left text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 font-outfit"
                >
                  <FileIcon className="w-3.5 h-3.5 shrink-0 text-zinc-500 dark:text-zinc-600" />
                  <span className="truncate">{n.title}</span>
                </button>
              ))}
          </div>
        </ScrollArea>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-zinc-200 dark:border-white/5">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-syne font-bold shrink-0 shadow-md">
            {user?.username?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-200 truncate font-outfit">
              {user?.username ?? ""}
            </p>
            <p className="text-[11px] text-zinc-500 truncate font-outfit">
              {user?.email ?? ""}
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-white/4 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 h-screen flex-col border-r border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-[rgba(10,14,22,.92)] backdrop-blur-lg">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar via Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-r-0 bg-white dark:bg-[rgba(10,14,22,.95)]" showCloseButton={false}>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {SidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}