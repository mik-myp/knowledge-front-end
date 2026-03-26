import { CodeHighlighter, Sources } from "@ant-design/x"
import { XMarkdown } from "@ant-design/x-markdown"
import "@ant-design/x-markdown/dist/x-markdown.css"
import "@ant-design/x-markdown/themes/light.css"
import type { ComponentProps as XMarkdownComponentProps } from "@ant-design/x-markdown"
import type { TChatMessageSource } from "@/types/chat"

/**
 * AI 对话 Markdown 内容组件的入参。
 */
type ChatMarkdownContentProps = {
  content: string
  sources?: TChatMessageSource[]
}

/**
 * 生成来源片段的位置描述，优先展示页码，再展示片段序号。
 */
const getSourceLocationText = (source: TChatMessageSource): string => {
  const locationParts: string[] = []

  if (typeof source.page === "number") {
    locationParts.push(`P${source.page}`)
  }

  locationParts.push(`片段 ${source.chunkSequence + 1}`)

  return locationParts.join(" · ")
}

/**
 * 将来源数组整理为 Sources 组件需要的数据，并去掉重复片段。
 */
const buildSourceItems = (sources?: TChatMessageSource[]) => {
  if (!sources?.length) {
    return []
  }

  const uniqueSourceMap = new Map<string, TChatMessageSource>()

  sources.forEach((source) => {
    const key = `${source.documentId}-${source.chunkSequence}`

    if (!uniqueSourceMap.has(key)) {
      uniqueSourceMap.set(key, source)
    }
  })

  return [...uniqueSourceMap.values()].map((source) => ({
    key: `${source.documentId}-${source.chunkSequence}`,
    title: `${source.documentName} · ${getSourceLocationText(source)}`,
    url: `/documents/${source.documentId}`,
  }))
}

/**
 * 使用 Ant Design X 官方代码高亮组件渲染 Markdown 代码块。
 */
const MarkdownCode = ({ children, className }: XMarkdownComponentProps) => {
  const lang = className?.match(/language-(\w+)/)?.[1]
  const code =
    typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children.join("")
        : null

  if (!code) {
    return null
  }

  return (
    <CodeHighlighter
      lang={lang}
      prismLightMode
      className="overflow-hidden rounded-xl"
      classNames={{
        code: "border-none",
      }}
    >
      {code}
    </CodeHighlighter>
  )
}

/**
 * 渲染 AI 回复中的 Markdown 内容和引用来源。
 */
const ChatMarkdownContent = ({
  content,
  sources,
}: ChatMarkdownContentProps) => {
  const sourceItems = buildSourceItems(sources)

  return (
    <div className="flex flex-col gap-3">
      <XMarkdown
        content={content}
        escapeRawHtml
        openLinksInNewTab
        className="x-markdown-light text-sm leading-7"
        components={{
          code: MarkdownCode,
        }}
      />
      {sourceItems.length > 0 ? (
        <Sources
          title={`来源 ${sourceItems.length}`}
          items={sourceItems}
          defaultExpanded={false}
          className="max-w-full"
        />
      ) : null}
    </div>
  )
}

export default ChatMarkdownContent
