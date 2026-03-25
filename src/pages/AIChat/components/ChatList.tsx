import { XMarkdown } from "@ant-design/x-markdown"
import "@ant-design/x-markdown/dist/x-markdown.css"
import type { TChatListProps } from "@/types/ai-chat"
import type { TChatMessageSource } from "@/types/chat"
import { Bubble, CodeHighlighter, Sources } from "@ant-design/x"
import type { BubbleListProps } from "@ant-design/x/es/bubble"
import type { ComponentProps as XMarkdownComponentProps } from "@ant-design/x-markdown"
import type { GetRef } from "antd"
import { Spin } from "antd"
import { isValidElement, useEffect, useMemo, useRef } from "react"

const getTextContent = (content: unknown): string => {
  if (typeof content === "string") {
    return content
  }

  if (Array.isArray(content)) {
    return content.map((item) => getTextContent(item)).join("")
  }

  return String(content ?? "")
}

const getSourceLocationText = (source: TChatMessageSource): string => {
  const locationParts: string[] = []

  if (typeof source.page === "number") {
    locationParts.push(`P${source.page}`)
  }

  locationParts.push(`片段 ${source.chunkSequence + 1}`)

  return locationParts.join(" · ")
}

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
    <CodeHighlighter
      lang={normalizedLang}
      className="my-4 overflow-hidden rounded-2xl"
      prismLightMode
      classNames={{
        code: "border-none",
      }}
    >
      {code}
    </CodeHighlighter>
  )
}

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

const renderBubbleContent = (
  content: unknown,
  sources?: TChatMessageSource[]
) => {
  if (isValidElement(content)) {
    return content
  }

  return renderMarkdownContent(String(content ?? ""), sources)
}

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

const ErrorIndicator = ({ text }: { text?: string }) => {
  return <div className="text-sm leading-7 text-red-500">{text}</div>
}

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
