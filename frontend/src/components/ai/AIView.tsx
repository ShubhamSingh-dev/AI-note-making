import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import { useLayoutStore } from '@/store/layoutStore';
import { cn } from '@/lib/utils';
import { Zap, Send, RotateCcw, Plus, Menu } from 'lucide-react';
import { useSendMessage, useNewConversation, useGetConversations } from '@/hooks/useAi';
import { parseMarkdown } from '@/lib/ai';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalMessage {
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

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-2.5"
    >
      <div className="w-7 h-7 rounded-full bg-linear-to-br from-teal-500 to-indigo-500 flex items-center justify-center shrink-0">
        <Zap className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-zinc-100 dark:bg-white/6 rounded-[18px_18px_18px_4px] px-4 py-3 flex gap-1.5 items-center">
        {['[animation-delay:0s]', '[animation-delay:0.15s]', '[animation-delay:0.3s]'].map((delayCls, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce ${delayCls}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Conversation history sidebar item ───────────────────────────────────────

function ConversationItem({
  preview,
  isActive,
  onClick,
}: {
  id: string;
  preview: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-xl text-[12px] font-outfit transition-all truncate',
        isActive
          ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
          : 'text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
      )}
    >
      {preview || 'New conversation'}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIView() {
  const { setMobileMenuOpen } = useLayoutStore();
  const user = useAuthStore((s) => s.user);

  // Active conversation ID — null means "start fresh on first message"
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Local optimistic messages for instant UI feedback
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useGetConversations();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: newConversation, isPending: isCreatingConversation } = useNewConversation();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // ─── Send ───────────────────────────────────────────────────────────────

  const handleSend = (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: LocalMessage = { id: uid(), role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    sendMessage(
      { message: text.trim(), conversationId: activeConversationId ?? undefined },
      {
        onSuccess: (response) => {
          const aiMsg: LocalMessage = {
            id: uid(),
            role: 'ai',
            content: response.data.response,
          };
          setMessages((prev) => [...prev, aiMsg]);

          if (!activeConversationId) {
            // conversations will re-fetch due to invalidation in useAI
          }
        },
      }
    );
  };

  // After a first message with no active conversation, set the most recent one
  useEffect(() => {
    if (!activeConversationId && conversations && conversations.length > 0 && messages.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, messages.length]);

  // ─── New chat ────────────────────────────────────────────────────────────

  const handleNewChat = () => {
    newConversation(undefined, {
      onSuccess: (response) => {
        setActiveConversationId(response.data.id);
        setMessages([]);
      },
    });
  };

  // ─── Switch conversation ─────────────────────────────────────────────────

  const handleSelectConversation = (id: string) => {
    if (id === activeConversationId) return;
    setActiveConversationId(id);
    const conv = conversations?.find((c: { id: string }) => c.id === id);
    if (conv?.messages) {
      setMessages(
        conv.messages.map((m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role === 'user' ? 'user' : 'ai',
          content: m.content,
        }))
      );
    } else {
      setMessages([]);
    }
  };

  // ─── Keyboard handler ────────────────────────────────────────────────────

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ─── Conversation sidebar — hidden on mobile/tablet, shown on lg+ ─── */}
      <aside className="hidden lg:flex w-52 shrink-0 border-r border-zinc-200 dark:border-white/5 flex-col py-4 gap-2 bg-white dark:bg-white/3">
        <div className="px-3 mb-1 flex items-center justify-between">
          <span className="text-[10px] font-syne font-bold uppercase tracking-[.12em] text-zinc-500 dark:text-zinc-600">
            History
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNewChat}
            disabled={isCreatingConversation}
            className="w-6 h-6 rounded-lg text-zinc-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-white/5"
            title="New conversation"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          {conversationsLoading && (
            <div className="space-y-1.5 px-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 rounded-xl bg-zinc-200 dark:bg-white/4" />
              ))}
            </div>
          )}

          {!conversationsLoading && (!conversations || conversations.length === 0) && (
            <p className="text-[11.5px] text-zinc-500 dark:text-zinc-600 font-outfit italic px-3 py-2">
              No conversations yet
            </p>
          )}

          {!conversationsLoading &&
            conversations?.map((conv: { id: string; messages: { content: string }[] }) => (
              <ConversationItem
                key={conv.id}
                id={conv.id}
                preview={conv.messages?.[0]?.content?.slice(0, 40) ?? 'New conversation'}
                isActive={conv.id === activeConversationId}
                onClick={() => handleSelectConversation(conv.id)}
              />
            ))}
        </ScrollArea>
      </aside>

      {/* ─── Main chat area ─── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-5 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-white/3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger — visible on mobile/tablet only */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-teal-600 dark:hover:text-teal-400"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-syne font-bold text-lg sm:text-xl text-zinc-900 dark:text-white flex items-center gap-2.5">
                AI Assistant
                <span className="flex items-center gap-1.5 text-[11px] bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full font-syne font-semibold border border-teal-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
                  <span className="hidden sm:inline">Online</span>
                </span>
              </h1>
              <p className="hidden sm:block text-xs text-zinc-500 mt-0.5 font-outfit">
                Ask me anything about your notes
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              disabled={isCreatingConversation}
              className="border-zinc-300 dark:border-white/8 bg-white dark:bg-white/4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-syne gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 sm:px-6 md:px-8 py-6">
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
                className="font-syne font-bold text-lg text-zinc-900 dark:text-white mb-2"
              >
                What can I help with?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18 }}
                className="text-sm text-zinc-500 max-w-xs mb-8 font-outfit"
              >
                I can create, search, update and summarize your notes using
                natural language.
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
                    onClick={() => handleSend(q.prompt)}
                    disabled={isSending}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-white/7 bg-zinc-50 dark:bg-white/3 hover:bg-zinc-100 dark:hover:bg-white/6 text-left text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all font-outfit disabled:opacity-40"
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
                    className={cn(
                      'flex items-end gap-2.5',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-linear-to-br from-teal-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {msg.role === 'user' ? (
                      <div className="bg-teal-500 text-white rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[13.5px] leading-snug max-w-[80%] sm:max-w-xs font-outfit">
                        {msg.content}
                      </div>
                    ) : (
                      <div
                        className="bg-zinc-100 dark:bg-white/6 text-zinc-800 dark:text-zinc-300 rounded-[18px_18px_18px_4px] px-3.5 py-2.5 text-[13.5px] leading-relaxed max-w-[80%] sm:max-w-sm font-outfit whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdown(msg.content),
                        }}
                      />
                    )}
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-linear-to-br from-teal-400 to-indigo-500 flex items-center justify-center shrink-0 text-white text-[11px] font-syne font-bold shadow-md">
                        {(user?.username?.[0] ?? 'U').toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isSending && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t border-zinc-200 dark:border-white/5 shrink-0">
          <div className="flex gap-2 sm:gap-3 items-end max-w-3xl mx-auto">
            <div className="flex-1 rounded-2xl border border-zinc-300 dark:border-white/7 bg-zinc-50 dark:bg-white/4 focus-within:border-teal-500/40 dark:focus-within:border-teal-500/30 transition-all">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about your notes…"
                rows={1}
                className="border-0 bg-transparent text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none min-h-0 font-outfit text-[13.5px] px-4 py-3 max-h-28 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="px-3 pb-2">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-outfit">
                  Enter ↵ send · Shift+Enter new line
                </span>
              </div>
            </div>
            <Button
              onClick={() => handleSend(input)}
              disabled={isSending || !input.trim()}
              className="w-11 h-11 shrink-0 bg-teal-500 hover:bg-teal-400 rounded-2xl shadow-lg shadow-teal-500/25 p-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-zinc-900" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}