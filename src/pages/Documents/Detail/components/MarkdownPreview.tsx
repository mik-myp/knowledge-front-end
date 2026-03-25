import { XMarkdown } from "@ant-design/x-markdown"

type MarkdownPreviewProps = {
  content?: string
}

const MarkdownPreview = ({ content }: MarkdownPreviewProps) => {
  return (
    <XMarkdown
      className="x-markdown-light scrollbar-none h-full overflow-y-auto"
      content={content ?? ""}
    />
  )
}

export default MarkdownPreview
