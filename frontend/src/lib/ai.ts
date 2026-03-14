/**
 * Lightweight markdown-to-HTML converter for AI chat responses.
 * Sanitizes output to prevent XSS before rendering.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function parseMarkdown(text: string): string {
  // Escape first, then selectively re-add safe HTML tags
  const escaped = escapeHtml(text);

  return (
    escaped
      // Code blocks (must come before inline code)
      .replace(
        /```(\w+)?\n?([\s\S]*?)```/g,
        '<pre class="bg-white/6 rounded-lg px-3 py-2 text-[12px] overflow-x-auto my-2 font-mono text-zinc-300"><code>$2</code></pre>'
      )
      // Inline code
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-white/8 rounded px-1 py-0.5 text-[12px] font-mono text-teal-300">$1</code>'
      )
      // Bold
      .replace(
        /\*\*([^*]+)\*\*/g,
        '<strong class="text-zinc-100 font-semibold">$1</strong>'
      )
      // Italic
      .replace(/\*([^*]+)\*/g, '<em class="text-zinc-300">$1</em>')
      // Bullet lists
      .replace(
        /^[-•]\s+(.+)$/gm,
        '<li class="ml-4 list-disc text-zinc-300">$1</li>'
      )
      .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="my-1.5 space-y-0.5">$1</ul>')
      // Line breaks
      .replace(/\n/g, "<br />")
  );
}
