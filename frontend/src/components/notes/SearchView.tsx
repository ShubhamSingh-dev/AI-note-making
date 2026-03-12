import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNotesStore } from '@/store/notesStore';
import type { Note } from '@/types/note';
import { Search, X } from 'lucide-react';
import { format } from 'date-fns';

const ACCENTS = [
  'linear-gradient(90deg,#14b8a6,#0d9488)',
  'linear-gradient(90deg,#6366f1,#8b5cf6)',
  'linear-gradient(90deg,#f59e0b,#ef4444)',
  'linear-gradient(90deg,#ec4899,#f43f5e)',
  'linear-gradient(90deg,#22c55e,#10b981)',
  'linear-gradient(90deg,#3b82f6,#6366f1)',
];

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-teal-500/25 text-teal-300 rounded px-0.5">$1</mark>');
}

export default function SearchView() {
  const notes = useNotesStore((s) => s.notes);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);
  const [searched, setSearched] = useState(false);
  const [detailNote, setDetailNote] = useState<Note | null>(null);

  const doSearch = (q = query) => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) return;
    setSearched(true);
    setResults(
      notes.filter(
        (n) => n.title.toLowerCase().includes(trimmed) || n.content.toLowerCase().includes(trimmed)
      )
    );
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') doSearch();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/[.05] bg-white/[.01] flex-shrink-0">
        <h1 className="font-syne font-bold text-xl text-white mb-4">Search Notes</h1>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search titles and content…"
              className="pl-10 pr-10 bg-white/[.05] border-white/[.08] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-teal-500/45 focus-visible:ring-teal-500/10 font-outfit"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={() => doSearch()}
            disabled={!query.trim()}
            className="bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold font-syne px-5 disabled:opacity-40"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1 px-8 py-6">
        {!searched && (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[.04] border border-white/[.06] flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm font-outfit">Type something to search your notes</p>
            <p className="text-zinc-600 text-xs mt-1 font-outfit">{notes.length} notes available</p>
          </div>
        )}

        {searched && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center mt-20 text-center"
          >
            <Search className="w-10 h-10 text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm font-outfit">No results found for "{query}"</p>
            <p className="text-zinc-600 text-xs mt-1 font-outfit">Try a different keyword</p>
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-xs text-zinc-500 mb-4 font-outfit">
              Found <span className="text-teal-400 font-semibold">{results.length}</span>{' '}
              note{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {results.map((note, i) => {
                  const accent = ACCENTS[i % ACCENTS.length];
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.35 }}
                      onClick={() => setDetailNote(note)}
                      className="relative rounded-2xl p-4 border border-white/[.06] bg-white/[.03] hover:bg-white/[.055] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer group"
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
                        style={{ background: accent }}
                      />
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3
                          className="font-syne font-semibold text-[13.5px] text-zinc-100 leading-snug line-clamp-1 flex-1"
                          dangerouslySetInnerHTML={{ __html: highlight(note.title, query) }}
                        />
                        {note.isCompleted && (
                          <Badge className="bg-teal-500/15 text-teal-400 border-none text-[10.5px] font-syne shrink-0">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p
                        className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed mb-2 font-outfit"
                        dangerouslySetInnerHTML={{ __html: highlight(note.content.slice(0, 120), query) }}
                      />
                      <span className="text-[11px] text-zinc-600 font-outfit">
                        {format(new Date(note.createdAt), 'MMM d, yyyy')}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </ScrollArea>

      {/* Detail Dialog */}
      <Dialog open={!!detailNote} onOpenChange={(open) => !open && setDetailNote(null)}>
        <DialogContent className="bg-zinc-900/95 border-white/[.08] text-zinc-100 max-w-[520px] backdrop-blur-xl">
          <DialogHeader>
            <div className="flex-1">
              {detailNote?.isCompleted && (
                <Badge className="bg-teal-500/15 text-teal-400 border-none text-[11px] font-syne mb-1.5">
                  ✓ Completed
                </Badge>
              )}
              <DialogTitle className="font-syne font-bold text-lg text-white leading-snug">
                {detailNote?.title}
              </DialogTitle>
              <p className="text-xs text-zinc-500 mt-1.5 font-outfit">
                {detailNote && format(new Date(detailNote.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-outfit pt-2">
              {detailNote?.content}
            </p>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}