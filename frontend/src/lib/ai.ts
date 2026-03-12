import type { Note } from '@/types/note';

export function parseMarkdown(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-100">$1</strong>');
}

export function getAIReply(
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
