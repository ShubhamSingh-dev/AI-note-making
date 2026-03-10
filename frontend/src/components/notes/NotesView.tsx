import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea as ShadTextarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useNotesStore } from '@/store/notesStore';
import { useAuthStore } from '@/store/authStore';
import type { Note } from '@/types/note';
import { toast } from 'sonner';
import { Edit3, Trash2, FileText, Send, Zap } from 'lucide-react';
import { format } from 'date-fns';

const ACCENTS = [
  'linear-gradient(90deg,#14b8a6,#0d9488)',
  'linear-gradient(90deg,#6366f1,#8b5cf6)',
  'linear-gradient(90deg,#f59e0b,#ef4444)',
  'linear-gradient(90deg,#ec4899,#f43f5e)',
  'linear-gradient(90deg,#22c55e,#10b981)',
  'linear-gradient(90deg,#3b82f6,#6366f1)',
];

const PER_PAGE = 12;

interface ChatMsg {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const uid = () => Math.random().toString(36).slice(2);

function parseMarkdown(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-100">$1</strong>');
}

function getAIReply(
  msg: string,
  notes: Note[],
  addNote: (title: string, content: string) => void,
  username?: string
): string {
  const m = msg.toLowerCase();

  if (m.includes('list') || m.includes('show all') || m.includes('all my notes')) {
    if (!notes.length) return "You don't have any notes yet! Type something like \"Create a note about...\" to get started.";
    return `You have **${notes.length} notes**:\n\n${notes
      .map((n, i) => `${i + 1}. **${n.title}**${n.isCompleted ? ' ✓' : ''}\n   ${n.content.slice(0, 55)}…`)
      .join('\n\n')}`;
  }

  if (m.includes('creat') || m.includes('add') || m.includes('new note') || m.includes('titled') || m.includes('note about') || m.includes('write')) {
    const titleMatch =
      msg.match(/titled?\s+["']?([^"'\n,]+)/i)?.[1] ||
      msg.match(/note about\s+([^.!?\n]+)/i)?.[1] ||
      msg.match(/write(?:\s+a(?:\s+note)?)?\s+(?:about\s+)?([^.!?\n]+)/i)?.[1] ||
      'New Note';
    const contentMatch =
      msg.match(/with\s+(?:content[:\s]+)?(.+)/is)?.[1] ||
      msg.match(/:\s*(.+)/s)?.[1] ||
      msg;
    const title = titleMatch.trim().slice(0, 60);
    const content = contentMatch.trim().length > 5 ? contentMatch.trim() : `Note about ${title}`;
    addNote(title, content);
    return `✓ Done! Created note **"${title}"**.\n\nYou can see it at the top of your notes. Want me to create another?`;
  }

  if (m.includes('search') || m.includes('find') || m.includes('look for')) {
    const kw = msg.match(/(?:for|about)\s+["']?([^"'\n]+)/i)?.[1]?.trim() || '';
    if (!kw) return 'What would you like me to search for?';
    const found = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(kw.toLowerCase()) ||
        n.content.toLowerCase().includes(kw.toLowerCase())
    );
    if (!found.length) return `No notes matched **"${kw}"**. Try a different keyword.`;
    return `Found **${found.length} note${found.length > 1 ? 's' : ''}** matching "${kw}":\n\n${found
      .map((n) => `• **${n.title}**\n  ${n.content.slice(0, 80)}…`)
      .join('\n\n')}`;
  }

  if (m.includes('summar') || m.includes('brief')) {
    const n = notes[0];
    if (!n) return 'No notes to summarize yet.';
    return `Summary of **"${n.title}"**:\n\n${n.content.slice(0, 200)}${n.content.length > 200 ? '…' : ''}\n\nThe note has ${n.content.split('\n').filter(Boolean).length} lines.`;
  }

  if (m.includes('hello') || m.includes('hi ') || m.includes('hey'))
    return `Hey ${username || 'there'}! 👋\n\nI'm your AI. Just tell me what you want to capture and I'll create a note instantly. Try:\n\n• "**Create a note about...**"\n• "**Search for...**"\n• "**List all my notes**"`;

  if (m.includes('help'))
    return `Here's what I can do:\n\n• **Create notes** — "Add a note about my meetings today"\n• **Search notes** — "Find notes about TypeScript"\n• **List notes** — "Show all my notes"\n• **Summarize** — "Summarize my latest note"\n\nJust type naturally!`;

  // Default: treat as note creation
  if (msg.trim().length > 5) {
    const lines = msg.split('\n');
    const title = lines[0].slice(0, 60).replace(/^(create|add|write|note:?\s*)/i, '').trim() || 'Quick Note';
    const content = msg.trim();
    addNote(title, content);
    return `✓ Captured as **"${title}"**!\n\nTip: You can be more specific, e.g. "Create a note titled [name] with [content]"`;
  }

  return 'I\'m here to help! Tell me what to note down, or ask me to list/search your existing notes.';
}

const QUICK_PROMPTS = [
  { emoji: '📋', prompt: 'List all my notes' },
  { emoji: '✏️', prompt: 'Create a note titled Ideas with some inspiration' },
  { emoji: '🔍', prompt: 'Search notes for meeting' },
  { emoji: '✨', prompt: 'Summarize my latest note' },
];

export default function NotesView() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);

  // Dialogs
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', isCompleted: false });
  const [detailNote, setDetailNote] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // AI chat
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(notes.length / PER_PAGE);
  const pageNotes = notes.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const openEdit = (note: Note) => {
    setEditForm({ title: note.title, content: note.content, isCompleted: note.isCompleted });
    setEditNote(note);
  };

  const handleEditSave = () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    if (editNote) {
      updateNote(editNote.id, editForm.title.trim(), editForm.content.trim(), editForm.isCompleted);
      toast.success('Note updated');
      setEditNote(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    toast.success('Note deleted');
    setDeleteId(null);
    setDetailNote(null);
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: ChatMsg = { id: uid(), role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setPage(1); // reset to first page so new notes appear

    setTimeout(() => {
      const reply = getAIReply(text, notes, addNote, user?.username);
      setMessages((prev) => [...prev, { id: uid(), role: 'ai', text: reply }]);
      setIsTyping(false);
    }, 600 + Math.random() * 500);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/[.05] bg-white/[.01] flex-shrink-0">
        <div>
          <h1 className="font-syne font-bold text-xl text-white">All Notes</h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-outfit">Your personal knowledge base</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 font-syne text-[11px] px-2.5">
            {notes.length} notes
          </Badge>
          <span className="flex items-center gap-1.5 text-[11px] bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-full font-syne font-semibold border border-teal-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            AI Active
          </span>
        </div>
      </div>

      {/* ─── Notes grid (scrollable) ─── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-8 py-5">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[.04] border border-white/[.06] flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-zinc-600" />
              </div>
              <p className="font-syne font-semibold text-zinc-400 text-sm mb-1">No notes yet</p>
              <p className="text-xs text-zinc-600 font-outfit">
                Use the AI input below to create your first note
              </p>
            </div>
          ) : (
            <>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {pageNotes.map((note, i) => {
                    const accent = ACCENTS[((page - 1) * PER_PAGE + i) % ACCENTS.length];
                    return (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
                          {note.content.slice(0, 95)}{note.content.length > 95 ? '…' : ''}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-600 font-outfit">
                            {format(new Date(note.createdAt), 'MMM d, yyyy')}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(note); }}
                              className="w-6 h-6 rounded-lg bg-white/[.06] flex items-center justify-center text-zinc-500 hover:text-teal-400 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteId(note.id); }}
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
                    variant="outline" size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-white/[.08] bg-white/[.04] text-zinc-400 hover:text-zinc-200 font-outfit"
                  >← Prev</Button>
                  <span className="text-xs text-zinc-500 font-syne">Page {page} of {totalPages}</span>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-white/[.08] bg-white/[.04] text-zinc-400 hover:text-zinc-200 font-outfit"
                  >Next →</Button>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </div>

      {/* ─── AI Chat log (mini, collapsible when empty) ─── */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[.05] overflow-hidden"
          >
            <ScrollArea className="max-h-48 px-8 py-3">
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {msg.role === 'user' ? (
                      <div className="bg-teal-500 text-white rounded-[14px_14px_4px_14px] px-3 py-1.5 text-[12.5px] leading-snug max-w-xs font-outfit">
                        {msg.text}
                      </div>
                    ) : (
                      <div
                        className="bg-white/[.06] text-zinc-300 rounded-[14px_14px_14px_4px] px-3 py-1.5 text-[12.5px] leading-relaxed max-w-sm font-outfit whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                      />
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white/[.06] rounded-[14px_14px_14px_4px] px-3 py-2 flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AI Input Bar ─── */}
      <div className="px-6 pb-5 pt-3 border-t border-white/[.05] bg-white/[.01] flex-shrink-0">
        {/* Quick prompts (shown only when no messages yet) */}
        {messages.length === 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q.prompt}
                onClick={() => sendMessage(q.prompt)}
                className="text-[11.5px] font-outfit text-zinc-500 hover:text-zinc-300 px-2.5 py-1 rounded-lg border border-white/[.06] bg-white/[.03] hover:bg-white/[.06] transition-all"
              >
                {q.emoji} {q.prompt.slice(0, 28)}{q.prompt.length > 28 ? '…' : ''}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end max-w-full">
          <div className="flex-1 rounded-2xl border border-white/[.08] bg-white/[.04] focus-within:border-teal-500/35 transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tell me what to note down, or ask anything about your notes…"
              rows={1}
              className="border-0 bg-transparent text-zinc-200 placeholder:text-zinc-600 resize-none min-h-0 font-outfit text-[13.5px] px-4 py-3 max-h-28 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="px-4 pb-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-600 font-outfit">
                Enter ↵ to send · Shift+Enter new line
              </span>
              <span className="text-[10.5px] text-teal-500/60 font-syne font-semibold">AI</span>
            </div>
          </div>
          <Button
            onClick={() => sendMessage(input)}
            disabled={isTyping || !input.trim()}
            className="w-11 h-11 flex-shrink-0 bg-teal-500 hover:bg-teal-400 rounded-2xl shadow-lg shadow-teal-500/20 p-0 disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-zinc-900" />
          </Button>
        </div>
      </div>

      {/* ─── Edit Dialog ─── */}
      <Dialog open={!!editNote} onOpenChange={(open) => !open && setEditNote(null)}>
        <DialogContent className="bg-zinc-900/95 border-white/[.08] text-zinc-100 max-w-[480px] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-syne font-bold text-[17px] text-white">Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10.5px] font-syne font-bold uppercase tracking-[.1em] text-zinc-500">Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="bg-white/[.05] border-white/[.08] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-teal-500/45 focus-visible:ring-teal-500/10 font-outfit"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10.5px] font-syne font-bold uppercase tracking-[.1em] text-zinc-500">Content</Label>
              <ShadTextarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={6}
                className="bg-white/[.05] border-white/[.08] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-teal-500/45 focus-visible:ring-teal-500/10 resize-none font-outfit"
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="edit-done"
                checked={editForm.isCompleted}
                onCheckedChange={(v) => setEditForm({ ...editForm, isCompleted: !!v })}
                className="border-zinc-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
              />
              <Label htmlFor="edit-done" className="text-sm text-zinc-300 cursor-pointer font-outfit">
                Mark as completed
              </Label>
            </div>
            <div className="flex gap-2.5 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-white/[.08] bg-white/[.04] text-zinc-400 hover:text-zinc-200 font-syne"
                onClick={() => setEditNote(null)}
              >Cancel</Button>
              <Button
                className="flex-1 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold font-syne"
                onClick={handleEditSave}
              >Save Note</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Dialog ─── */}
      <Dialog open={!!detailNote} onOpenChange={(open) => !open && setDetailNote(null)}>
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
                  {detailNote && format(new Date(detailNote.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => { setDetailNote(null); if (detailNote) openEdit(detailNote); }}
                  className="w-8 h-8 rounded-lg bg-white/[.05] flex items-center justify-center text-zinc-400 hover:text-teal-400 transition-all"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { if (detailNote) setDeleteId(detailNote.id); }}
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
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-zinc-900/95 border-white/[.08] text-zinc-100 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-syne text-white">Delete note permanently?</AlertDialogTitle>
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
