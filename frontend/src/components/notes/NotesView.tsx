import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea as ShadTextarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotesStore } from "@/store/notesStore";
import type { Note } from "@/types/note";
import { toast } from "sonner";
import { Edit3, Trash2, FileText, Plus } from "lucide-react";
import { format } from "date-fns";

const ACCENTS = [
  "linear-gradient(90deg,#14b8a6,#0d9488)",
  "linear-gradient(90deg,#6366f1,#8b5cf6)",
  "linear-gradient(90deg,#f59e0b,#ef4444)",
  "linear-gradient(90deg,#ec4899,#f43f5e)",
  "linear-gradient(90deg,#22c55e,#10b981)",
  "linear-gradient(90deg,#3b82f6,#6366f1)",
];

const PER_PAGE = 12;

export default function NotesView() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const [page, setPage] = useState(1);

  // Dialogs
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    isCompleted: false,
  });
  const [detailNote, setDetailNote] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // New note dialog
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", content: "" });

  const totalPages = Math.ceil(notes.length / PER_PAGE);
  const pageNotes = notes.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openEdit = (note: Note) => {
    setEditForm({
      title: note.title,
      content: note.content,
      isCompleted: note.isCompleted,
    });
    setEditNote(note);
  };

  const handleEditSave = () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    if (editNote) {
      updateNote(
        editNote.id,
        editForm.title.trim(),
        editForm.content.trim(),
        editForm.isCompleted
      );
      toast.success("Note updated");
      setEditNote(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    toast.success("Note deleted");
    setDeleteId(null);
    setDetailNote(null);
  };

  const handleNewNote = () => {
    if (!newForm.title.trim() || !newForm.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    addNote(newForm.title.trim(), newForm.content.trim());
    toast.success("Note created");
    setNewForm({ title: "", content: "" });
    setNewNoteOpen(false);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/[.05] bg-white/[.01] flex-shrink-0">
        <div>
          <h1 className="font-syne font-bold text-xl text-white">All Notes</h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-outfit">
            Your personal knowledge base
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 font-syne text-[11px] px-2.5">
            {notes.length} notes
          </Badge>
          <Button
            onClick={() => setNewNoteOpen(true)}
            size="sm"
            className="bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold font-syne gap-1.5 shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            New Note
          </Button>
        </div>
      </div>

      {/* ─── Notes grid (scrollable) ─── */}
      <ScrollArea className="flex-1 px-8 py-5">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[.04] border border-white/[.06] flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-zinc-600" />
            </div>
            <p className="font-syne font-semibold text-zinc-400 text-sm mb-1">
              No notes yet
            </p>
            <p className="text-xs text-zinc-600 font-outfit mb-4">
              Create your first note to get started
            </p>
            <Button
              onClick={() => setNewNoteOpen(true)}
              size="sm"
              className="bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold font-syne gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Note
            </Button>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {pageNotes.map((note, i) => {
                  const accent =
                    ACCENTS[((page - 1) * PER_PAGE + i) % ACCENTS.length];
                  return (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        delay: i * 0.04,
                        duration: 0.35,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      onClick={() => setDetailNote(note)}
                      className="group relative rounded-2xl p-4 cursor-pointer border border-white/[.06] bg-white/[.03] hover:bg-white/[.055] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                    >
                      {/* Accent top bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
                        style={{ background: accent }}
                      />
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-syne font-semibold text-[13.5px] text-zinc-100 leading-snug line-clamp-1 flex-1">
                          {note.title}
                        </h3>
                        {note.isCompleted && (
                          <Badge className="bg-teal-500/15 text-teal-400 border-none text-[10.5px] font-syne font-bold shrink-0 px-1.5 py-0">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-3 mb-3 font-outfit">
                        {note.content.slice(0, 95)}
                        {note.content.length > 95 ? "…" : ""}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-600 font-outfit">
                          {format(new Date(note.createdAt), "MMM d, yyyy")}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(note);
                            }}
                            className="w-6 h-6 rounded-lg bg-white/[.06] flex items-center justify-center text-zinc-500 hover:text-teal-400 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(note.id);
                            }}
                            className="w-6 h-6 rounded-lg bg-white/[.06] flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-white/[.08] bg-white/[.04] text-zinc-400 hover:text-zinc-200 font-outfit"
                >
                  ← Prev
                </Button>
                <span className="text-xs text-zinc-500 font-syne">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-white/[.08] bg-white/[.04] text-zinc-400 hover:text-zinc-200 font-outfit"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </ScrollArea>

      {/* ─── New Note Dialog ─── */}
      <Dialog
        open={newNoteOpen}
        onOpenChange={(open) => {
          setNewNoteOpen(open);
          if (!open) setNewForm({ title: "", content: "" });
        }}
      >
        <DialogContent className="bg-zinc-900/95 border-white/[.08] text-zinc-100 max-w-[480px] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-syne font-bold text-[17px] text-white">
              New Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10.5px] font-syne font-bold uppercase tracking-[.1em] text-zinc-500">
                Title
              </Label>
              <Input
                value={newForm.title}
                onChange={(e) =>
                  setNewForm({ ...newForm, title: e.target.value })
                }
                placeholder="Note title…"
                className="bg-white/[.05] border-white/[.08] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-teal-500/45 focus-visible:ring-teal-500/10 font-outfit"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10.5px] font-syne font-bold uppercase tracking-[.1em] text-zinc-500">
                Content
              </Label>
              <ShadTextarea
                value={newForm.content}
                onChange={(e) =>
                  setNewForm({ ...newForm, content: e.target.value })
                }
                placeholder="Write your note…"
                rows={6}
                className="bg-white/[.05] border-white/[.08] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-teal-500/45 focus-visible:ring-teal-500/10 resize-none font-outfit"
              />
            </div>
            <div className="flex gap-2.5 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-white/[.08] bg-white/[.04] text-zinc-400 hover:text-zinc-200 font-syne"
                onClick={() => setNewNoteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold font-syne"
                onClick={handleNewNote}
              >
                Create Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ─── */}
      <Dialog
        open={!!editNote}
        onOpenChange={(open) => !open && setEditNote(null)}
      >
        <DialogContent className="bg-zinc-900/95 border-white/[.08] text-zinc-100 max-w-[480px] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-syne font-bold text-[17px] text-white">
              Edit Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10.5px] font-syne font-bold uppercase tracking-[.1em] text-zinc-500">
                Title
              </Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="bg-white/[.05] border-white/[.08] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-teal-500/45 focus-visible:ring-teal-500/10 font-outfit"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10.5px] font-syne font-bold uppercase tracking-[.1em] text-zinc-500">
                Content
              </Label>
              <ShadTextarea
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                rows={6}
                className="bg-white/[.05] border-white/[.08] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-teal-500/45 focus-visible:ring-teal-500/10 resize-none font-outfit"
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="edit-done"
                checked={editForm.isCompleted}
                onCheckedChange={(v) =>
                  setEditForm({ ...editForm, isCompleted: !!v })
                }
                className="border-zinc-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
              />
              <Label
                htmlFor="edit-done"
                className="text-sm text-zinc-300 cursor-pointer font-outfit"
              >
                Mark as completed
              </Label>
            </div>
            <div className="flex gap-2.5 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-white/[.08] bg-white/[.04] text-zinc-400 hover:text-zinc-200 font-syne"
                onClick={() => setEditNote(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold font-syne"
                onClick={handleEditSave}
              >
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Dialog ─── */}
      <Dialog
        open={!!detailNote}
        onOpenChange={(open) => !open && setDetailNote(null)}
      >
        <DialogContent className="bg-zinc-900/95 border-white/[.08] text-zinc-100 max-w-[520px] backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
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
                  {detailNote &&
                    format(new Date(detailNote.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setDetailNote(null);
                    if (detailNote) openEdit(detailNote);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/[.05] flex items-center justify-center text-zinc-400 hover:text-teal-400 transition-all"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (detailNote) setDeleteId(detailNote.id);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/[.05] flex items-center justify-center text-zinc-400 hover:text-red-400 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-outfit pt-2">
              {detailNote?.content}
            </p>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ─── */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="bg-zinc-900/95 border-white/[.08] text-zinc-100 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-syne text-white">
              Delete note permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 font-outfit">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[.08] bg-white/[.04] text-zinc-400 hover:text-zinc-200 font-syne">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-500/80 hover:bg-red-500 text-white font-syne"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
