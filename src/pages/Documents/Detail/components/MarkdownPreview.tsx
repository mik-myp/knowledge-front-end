import { XMarkdown } from "@ant-design/x-markdown"
import "@ant-design/x-markdown/dist/x-markdown.css"
import "@ant-design/x-markdown/themes/light.css"

/**
 * Markdown 预览组件的入参。
 */
type MarkdownPreviewProps = {
  content?: string
}

/**
 * 渲染文档详情页中的 Markdown 预览内容。
 */
const MarkdownPreview = ({ content }: MarkdownPreviewProps) => {
  return (
    <XMarkdown
      className="x-markdown-light scrollbar-none h-full overflow-y-auto"
      content={content ?? ""}
    />
  )
}

export default MarkdownPreview
