import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchNotes, useGetNotes } from "@/hooks/useNotes";
import type { Note } from "@/schemas/note.schema";
import { Search, X, Menu } from "lucide-react";
import { format } from "date-fns";
import { ACCENTS } from "@/constants/constants";
import { useLayoutStore } from "@/store/layoutStore";


function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]11.03]/g, "11.110000000000001$&")})`,
    "gi"
  );
  return text.replace(
    regex,
    '<mark class="bg-teal-500/25 text-teal-600 dark:text-teal-300 rounded px-0.5">$1</mark>'
  );
}

function SearchCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 border border-zinc-200 dark:border-white/6 bg-zinc-50 dark:bg-white/3 space-y-2">
      <Skeleton className="h-4 w-3/4 bg-zinc-200 dark:bg-white/6" />
      <Skeleton className="h-3 w-full bg-zinc-100 dark:bg-white/4" />
      <Skeleton className="h-3 w-2/3 bg-zinc-100 dark:bg-white/4" />
      <Skeleton className="h-3 w-1/3 mt-2 bg-zinc-100 dark:bg-white/4" />
    </div>
  );
}

export default function SearchView() {
  const { setMobileMenuOpen } = useLayoutStore();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [detailNote, setDetailNote] = useState<Note | null>(null);

  // Total note count for the idle state hint
  const { data: allNotesData } = useGetNotes(1, 1);
  const totalNotes = allNotesData?.total ?? 0;

  // Only fires when submittedQuery has a value (enabled guard inside hook)
  const {
    data: results,
    isLoading,
    isError,
    isFetching,
  } = useSearchNotes(submittedQuery);

  const hasSearched = submittedQuery.trim().length > 0;
  const notes: Note[] = results ?? [];

  const doSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmittedQuery(trimmed);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch();
  };

  const clearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ─── Header ─── */}
      <div className="px-4 sm:px-6 md:px-8 py-5 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-white/3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          {/* Hamburger — only on mobile/tablet */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-teal-600 dark:hover:text-teal-400"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <h1 className="font-syne font-bold text-lg sm:text-xl text-zinc-900 dark:text-white">
            Search Notes
          </h1>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search titles and content…"
              className="pl-10 pr-10 bg-zinc-50 dark:bg-white/5 border-zinc-300 dark:border-white/8 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:border-teal-500/45 focus-visible:ring-teal-500/10 font-outfit"
              autoFocus
            />
            {query && (
              <button
                title="Clear search"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={doSearch}
            disabled={!query.trim() || isFetching}
            className="bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold font-syne px-4 sm:px-5 disabled:opacity-40"
          >
            {isFetching ? "…" : "Search"}
          </Button>
        </div>
      </div>

      {/* ─── Results ─── */}
      <ScrollArea className="flex-1 px-4 sm:px-6 md:px-8 py-6">
        {/* Idle state */}
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center mt-12 sm:mt-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/4 border border-zinc-200 dark:border-white/6 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-zinc-500 dark:text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm font-outfit">
              Type something to search your notes
            </p>
            <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-1 font-outfit">
              {totalNotes > 0
                ? `${totalNotes} note${totalNotes !== 1 ? "s" : ""} available`
                : "No notes yet"}
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {hasSearched && isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SearchCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {hasSearched && isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center mt-20 text-center"
          >
            <p className="text-zinc-500 text-sm font-outfit">
              Something went wrong. Please try again.
            </p>
          </motion.div>
        )}

        {/* No results */}
        {hasSearched && !isLoading && !isError && notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center mt-20 text-center"
          >
            <Search className="w-10 h-10 text-zinc-400 dark:text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm font-outfit">
              No results found for "{submittedQuery}"
            </p>
            <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-1 font-outfit">
              Try a different keyword
            </p>
          </motion.div>
        )}

        {/* Results grid */}
        {hasSearched && !isLoading && !isError && notes.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-zinc-500 mb-4 font-outfit">
              Found{" "}
              <span className="text-teal-600 dark:text-teal-400 font-semibold">
                {notes.length}
              </span>{" "}
              note{notes.length !== 1 ? "s" : ""} for "{submittedQuery}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {notes.map((note, i) => {
                  const accent = ACCENTS[i % ACCENTS.length];
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.35 }}
                      onClick={() => setDetailNote(note)}
                      className="relative rounded-2xl p-4 border border-zinc-200 dark:border-white/6 bg-white dark:bg-white/3 hover:bg-zinc-50 dark:hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer group shadow-sm dark:shadow-none"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-[2px] opacity-80 ${accent}`}
                      />
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3
                          className="font-syne font-semibold text-[13.5px] text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1 flex-1"
                          dangerouslySetInnerHTML={{
                            __html: highlight(note.title, submittedQuery),
                          }}
                        />
                        {note.isCompleted && (
                          <Badge className="bg-teal-500/15 text-teal-600 dark:text-teal-400 border-none text-[10.5px] font-syne shrink-0">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p
                        className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed mb-2 font-outfit"
                        dangerouslySetInnerHTML={{
                          __html: highlight(
                            note.content.slice(0, 120),
                            submittedQuery
                          ),
                        }}
                      />
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-outfit">
                        {format(new Date(note.createdAt), "MMM d, yyyy")}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </ScrollArea>

      {/* ─── Detail Dialog ─── */}
      <Dialog
        open={!!detailNote}
        onOpenChange={(open) => !open && setDetailNote(null)}
      >
        <DialogContent className="bg-white dark:bg-zinc-900/95 border-zinc-200 dark:border-white/8 text-zinc-900 dark:text-zinc-100 w-[calc(100vw-2rem)] sm:max-w-[520px] backdrop-blur-xl">
          <DialogHeader>
            <div className="flex-1">
              {detailNote?.isCompleted && (
                <Badge className="bg-teal-500/15 text-teal-600 dark:text-teal-400 border-none text-[11px] font-syne mb-1.5">
                  ✓ Completed
                </Badge>
              )}
              <DialogTitle className="font-syne font-bold text-lg text-zinc-900 dark:text-white leading-snug">
                {detailNote?.title}
              </DialogTitle>
              <p className="text-xs text-zinc-500 mt-1.5 font-outfit">
                {detailNote &&
                  format(new Date(detailNote.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-outfit pt-2">
              {detailNote?.content}
            </p>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
