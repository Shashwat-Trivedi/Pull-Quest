// components/MarkdownPreview.tsx

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="prose max-w-none prose-slate dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
