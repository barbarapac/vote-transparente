'use client'

interface Props {
  content: string
}

export function Markdown({ content }: Props) {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-green-800">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2 text-green-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-green-900">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br/>')

  return (
    <div
      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="mb-3">${html}</p>` }}
    />
  )
}
