import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/authStore';
import { useNotesStore } from '@/store/notesStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  FileText,
  Zap,
  Search,
  LogOut,
  Sun,
  Moon,
  FileIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV = [
  { id: 'notes', label: 'All Notes', icon: FileText, path: '/notes' },
  { id: 'ai', label: 'AI Assistant', icon: Zap, path: '/ai', badge: 'AI' },
  { id: 'search', label: 'Search', icon: Search, path: '/search' },
];

interface SidebarProps {
  view: string;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Sidebar({ view, isDark, onToggleTheme }: SidebarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const notes = useNotesStore((s) => s.notes);
  const { logout } = useAuth();

  return (
    <aside
      className="w-[228px] flex-shrink-0 h-screen flex flex-col border-r border-white/[.05]"
      style={{ background: 'rgba(10,14,22,.92)', backdropFilter: 'blur(16px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/[.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center shadow-md shadow-teal-500/30">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-syne font-bold text-[17px] text-white tracking-tight">Notiq</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="w-7 h-7 rounded-lg bg-white/[.05] text-zinc-500 hover:text-teal-400 hover:bg-white/[.08] transition-all"
              >
                {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-hidden flex flex-col">
        <p className="px-3 pt-3 pb-1.5 text-[10px] font-syne font-bold uppercase tracking-[.12em] text-zinc-600">
          Workspace
        </p>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all w-full text-left font-outfit',
                active
                  ? 'text-teal-400 bg-teal-500/10'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[.05]'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.id === 'notes' && (
                <span className="text-[10px] font-semibold bg-white/[.07] text-zinc-400 px-1.5 py-0.5 rounded-md font-syne">
                  {notes.length}
                </span>
              )}
              {item.badge && item.id !== 'notes' && (
                <span className="text-[10px] font-semibold bg-teal-500/15 text-teal-400 px-1.5 py-0.5 rounded-md font-syne">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}

        <p className="px-3 pt-5 pb-1.5 text-[10px] font-syne font-bold uppercase tracking-[.12em] text-zinc-600">
          Recent
        </p>
        <ScrollArea className="flex-1">
          <div className="space-y-0.5">
            {notes.slice(0, 5).map((n) => (
              <button
                key={n.id}
                onClick={() => navigate('/notes')}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[12.5px] font-medium transition-all w-full text-left text-zinc-500 hover:text-zinc-200 hover:bg-white/[.05] font-outfit"
              >
                <FileIcon className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" />
                <span className="truncate">{n.title}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/[.05]">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-syne font-bold flex-shrink-0 shadow-md">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-zinc-200 truncate font-outfit">
              {user?.username ?? ''}
            </p>
            <p className="text-[11px] text-zinc-500 truncate font-outfit">{user?.email ?? ''}</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="w-7 h-7 rounded-lg bg-white/[.04] text-zinc-500 hover:text-red-400 hover:bg-white/[.06] transition-all flex-shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );
}
