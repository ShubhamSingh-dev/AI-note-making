import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotesStore } from '@/store/notesStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Zap, Send, RotateCcw } from 'lucide-react';
import { getAIReply, parseMarkdown } from '@/lib/ai';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const uid = () => Math.random().toString(36).slice(2);

const QUICK_PROMPTS = [
  { emoji: '📋', label: 'List all notes', prompt: 'Show all my notes' },
  { emoji: '✏️', label: 'Create a note', prompt: 'Create a note titled Shopping List with milk, eggs, bread' },
  { emoji: '🔍', label: 'Search notes', prompt: 'Search my notes for meeting' },
  { emoji: '✨', label: 'Summarize note', prompt: 'Summarize my latest note' },
];

export default function AIView() {
  const { notes, addNote } = useNotesStore();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: uid(), role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = getAIReply(text, notes, addNote, user?.username);
      const aiMsg: Message = { id: uid(), role: 'ai', content: reply };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700 + Math.random() * 600);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/1.5 shrink-0">
        <div>
          <h1 className="font-syne font-bold text-xl text-white flex items-center gap-2.5">
            AI Assistant
            <span className="flex items-center gap-1.5 text-[11px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-syne font-semibold border border-teal-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Online
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-outfit">Ask me anything about your notes</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages([])}
          className="border-white/8 bg-white/4 text-zinc-400 hover:text-zinc-200 font-syne gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Chat
        </Button>
      </div>

      {/* Chat area */}
      <ScrollArea className="flex-1 px-8 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-64 text-center pb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 rounded-2xl bg-linear-to-br from-teal-500 to-indigo-500 flex items-center justify-center mb-5 shadow-xl shadow-teal-500/20"
            >
              <Zap className="w-7 h-7 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-syne font-bold text-lg text-white mb-2"
            >
              What can I help with?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="text-sm text-zinc-500 max-w-xs mb-8 font-outfit"
            >
              I can create, search, update and summarize your notes using natural language.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-2 gap-2 max-w-xs w-full"
            >
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => sendMessage(q.prompt)}
                  className="p-3 rounded-xl border border-white/7 bg-white/3 hover:bg-white/6 text-left text-xs text-zinc-400 transition-all font-outfit"
                >
                  {q.emoji} {q.label}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-5 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={cn('flex items-end gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-teal-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/20">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {msg.role === 'user' ? (
                    <div className="bg-teal-500 text-white rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[13.5px] leading-snug max-w-xs font-outfit">
                      {msg.content}
                    </div>
                  ) : (
                    <div
                      className="bg-white/6 text-zinc-300 rounded-[18px_18px_18px_4px] px-3.5 py-2.5 text-[13.5px] leading-relaxed max-w-sm font-outfit whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                    />
                  )}
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-teal-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white text-[11px] font-syne font-bold shadow-md">
                      {(user?.username?.[0] ?? 'U').toUpperCase()}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-teal-500 to-indigo-500 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white/6 rounded-[18px_18px_18px_4px] px-4 py-3 flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="px-6 pb-6 pt-3 border-t border-white/5 shrink-0">
        <div className="flex gap-3 items-end max-w-3xl mx-auto">
          <div className="flex-1 rounded-2xl border border-white/7 bg-white/4 focus-within:border-teal-500/30 transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about your notes…"
              rows={1}
              className="border-0 bg-transparent text-zinc-200 placeholder:text-zinc-600 resize-none min-h-0 font-outfit text-[13.5px] px-4 py-3 max-h-28 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="px-3 pb-2">
              <span className="text-[11px] text-zinc-600 font-outfit">
                Enter ↵ send · Shift+Enter new line
              </span>
            </div>
          </div>
          <Button
            onClick={() => sendMessage(input)}
            disabled={isTyping || !input.trim()}
            className="w-11 h-11 shrink-0 bg-teal-500 hover:bg-teal-400 rounded-2xl shadow-lg shadow-teal-500/25 p-0"
          >
            <Send className="w-4 h-4 text-zinc-900" />
          </Button>
        </div>
      </div>
    </div>
  );
}
