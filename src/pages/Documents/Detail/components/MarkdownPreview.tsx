import { XMarkdown } from "@ant-design/x-markdown"

/**
 * 描述 Markdown 预览组件的属性。
 */
type MarkdownPreviewProps = {
  content?: string
}

/**
 * 渲染Markdown预览组件。
 * @param props 组件属性。
 * @param props.content 内容。
 * @returns 返回组件渲染结果。
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
