'use client'

interface Props {
  content: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function Markdown({ content }: Props) {
  const html = escapeHtml(content)
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-5 mb-2 text-emerald-400">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-2 text-white">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3 text-white">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/^[*-] (.+)$/gm, '<li class="ml-4 list-disc text-slate-300 mb-1">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-slate-300 mb-1">$2</li>')
    .replace(/\n\n/g, '</p><p class="mb-3 text-slate-300 leading-relaxed">')
    .replace(/\n/g, '<br/>')
    .replace(/<\/li><br\/>/g, '</li>')

  return (
    <div
      className="text-slate-300 leading-relaxed text-sm"
      dangerouslySetInnerHTML={{ __html: `<p class="mb-3 text-slate-300 leading-relaxed">${html}</p>` }}
    />
  )
}
