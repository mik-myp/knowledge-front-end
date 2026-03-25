import { XMarkdown } from "@ant-design/x-markdown"
import "@ant-design/x-markdown/dist/x-markdown.css"
import type { TChatListProps } from "@/types/ai-chat"
import type { TChatMessageSource } from "@/types/chat"
import type { BubbleListProps } from "@ant-design/x/es/bubble"
import type { ComponentProps as XMarkdownComponentProps } from "@ant-design/x-markdown"
import type { GetRef } from "antd"
import { Spin } from "antd"
import { isValidElement, useEffect, useMemo, useRef } from "react"
import Bubble from "@ant-design/x/es/bubble"
import Sources from "@ant-design/x/es/sources"

/**
 * 提取文本内容。
 * @param content 内容。
 * @returns 返回字符串结果。
 */
const getTextContent = (content: unknown): string => {
  if (typeof content === "string") {
    return content
  }

  if (Array.isArray(content)) {
    return content.map((item) => getTextContent(item)).join("")
  }

  return String(content ?? "")
}

/**
 * 生成来源位置信息文本。
 * @param source 来源信息。
 * @returns 返回字符串结果。
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
 * 构建引用来源展示项。
 * @param sources 来源信息列表。
 * @returns 返回去重后的来源展示数据列表。
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
 * 渲染MarkdownCode组件。
 * @param props 组件属性。
 * @param props.children children。
 * @param props.className className。
 * @param props.lang lang。
 * @param props.block block。
 * @returns 返回组件渲染结果。
 */
const MarkdownCode = ({
  children,
  className,
  lang,
  block,
}: XMarkdownComponentProps) => {
  const code = getTextContent(children)
  const normalizedLang = lang?.trim() || className?.replace(/^language-/, "")

  if (!block) {
    return (
      <code className="rounded bg-black/5 px-1.5 py-0.5 text-[0.95em]">
        {code}
      </code>
    )
  }

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-black/10 bg-neutral-50">
      <div className="border-b border-black/8 px-4 py-2 text-[11px] font-medium tracking-[0.12em] text-black/45 uppercase">
        {normalizedLang || "text"}
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-sm leading-6 text-black/80">
        <code
          className={normalizedLang ? `language-${normalizedLang}` : undefined}
        >
          {code}
        </code>
      </pre>
    </div>
  )
}

/**
 * 渲染 Markdown 内容和来源列表。
 * @param content Markdown 文本内容。
 * @param sources 来源信息列表。
 * @returns 返回 Markdown 与引用来源组合后的 JSX 内容。
 */
const renderMarkdownContent = (
  content: string,
  sources?: TChatMessageSource[]
) => {
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

/**
 * 渲染消息气泡内容。
 * @param content 消息正文内容。
 * @param sources 当前消息关联的来源信息列表。
 * @returns 返回用于气泡展示的 JSX 内容。
 */
const renderBubbleContent = (
  content: unknown,
  sources?: TChatMessageSource[]
) => {
  if (isValidElement(content)) {
    return content
  }

  return renderMarkdownContent(String(content ?? ""), sources)
}

/**
 * 渲染ThinkingIndicator组件。
 * @param props 组件属性。
 * @param props.text text。
 * @returns 返回组件渲染结果。
 */
const ThinkingIndicator = ({ text }: { text?: string }) => {
  return (
    <div className="flex items-center gap-3 px-1 py-1">
      <div className="text-sm text-black/55">{text ?? "正在生成回答"}</div>
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-black/35 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-black/45 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-black/60" />
      </div>
    </div>
  )
}

/**
 * 渲染错误Indicator组件。
 * @param props 组件属性。
 * @param props.text text。
 * @returns 返回组件渲染结果。
 */
const ErrorIndicator = ({ text }: { text?: string }) => {
  return <div className="text-sm leading-7 text-red-500">{text}</div>
}

/**
 * 渲染对话列表组件。
 * @param props 组件属性。
 * @param props.conversationKey 会话标识。
 * @param props.messages 消息列表。
 * @param props.messageLoading 消息Loading。
 * @returns 返回组件渲染结果。
 */
const ChatList = ({
  conversationKey,
  messages,
  messageLoading,
}: TChatListProps) => {
  const bubbleListRef = useRef<GetRef<typeof Bubble.List>>(null)
  const scrollAnimationFrameRef = useRef<number | null>(null)

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (!bubbleListRef.current) {
      return
    }

    if (scrollAnimationFrameRef.current !== null) {
      cancelAnimationFrame(scrollAnimationFrameRef.current)
    }

    scrollAnimationFrameRef.current = requestAnimationFrame(() => {
      bubbleListRef.current?.scrollTo({
        top: "bottom",
        behavior,
      })
      scrollAnimationFrameRef.current = null
    })
  }

  const bubbleRole: BubbleListProps["role"] = useMemo(() => {
    return {
      ai: {
        placement: "start",
        typing: false,
        shape: "corner",
        contentRender: (content) => renderBubbleContent(content),
      },
      human: {
        placement: "end",
        typing: false,
        shape: "corner",
      },
      system: {
        shape: "corner",
        variant: "borderless",
        contentRender: (content) => renderBubbleContent(content),
      },
    }
  }, [])

  useEffect(() => {
    scrollToBottom("instant")
  }, [messageLoading, messages])

  useEffect(() => {
    if (messageLoading) {
      return
    }

    scrollToBottom("smooth")
  }, [conversationKey, messageLoading])

  useEffect(() => {
    return () => {
      if (scrollAnimationFrameRef.current !== null) {
        cancelAnimationFrame(scrollAnimationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden px-6">
        <Spin
          spinning={messageLoading}
          className="block h-full [&_.ant-spin-container]:h-full [&_.ant-spin-nested-loading]:h-full"
        >
          <Bubble.List
            ref={bubbleListRef}
            items={messages.map((item) => ({
              key: item.id,
              content:
                item.message.messageType === "ai" &&
                (item.status === "loading" || item.status === "updating") &&
                item.message.streamStatus === "progress" ? (
                  <ThinkingIndicator
                    text={item.message.content || "正在生成回答"}
                  />
                ) : item.message.messageType === "ai" &&
                  item.message.streamStatus === "error" ? (
                  <ErrorIndicator text={item.message.content} />
                ) : item.message.messageType === "human" ? (
                  item.message.content
                ) : (
                  renderBubbleContent(
                    item.message.content,
                    item.message.sources
                  )
                ),
              role: item.message.messageType,
            }))}
            styles={{
              root: {
                width: "100%",
                height: "100%",
                minHeight: 0,
                marginInline: "auto",
              },
              scroll: {
                scrollbarWidth: "none",
              },
            }}
            className="mx-auto h-full max-w-235 pb-6"
            role={bubbleRole}
          />
        </Spin>
      </div>
    </div>
  )
}

export default ChatList
