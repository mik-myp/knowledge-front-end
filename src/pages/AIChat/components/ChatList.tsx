import { XMarkdown } from "@ant-design/x-markdown"
import "@ant-design/x-markdown/dist/x-markdown.css"
import type { TChatListProps } from "@/types/ai-chat"
import { Bubble } from "@ant-design/x"
import type { BubbleListProps } from "@ant-design/x/es/bubble"
import { Spin } from "antd"
import { isValidElement, useEffect, useMemo, useRef } from "react"

const renderMarkdownContent = (content: string) => {
  return (
    <XMarkdown
      content={content}
      escapeRawHtml
      openLinksInNewTab
      className="text-sm leading-7"
    />
  )
}

const renderBubbleContent = (content: unknown) => {
  if (isValidElement(content)) {
    return content
  }

  return renderMarkdownContent(String(content ?? ""))
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

const ChatList = ({ messages, messageLoading }: TChatListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

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
    const scrollContainer = scrollContainerRef.current

    if (!scrollContainer) {
      return
    }

    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    })
  }, [messageLoading, messages])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-6"
      >
        <Spin spinning={messageLoading}>
          <div className="mx-auto w-full max-w-235 pb-6">
            <Bubble.List
              items={messages.map((item) => ({
                key: item.id,
                content:
                  item.message.messageType === "ai" &&
                  (item.status === "loading" || item.status === "updating") &&
                  item.message.streamStatus === "progress"
                    ? (
                        <ThinkingIndicator
                          text={item.message.content || "正在生成回答"}
                        />
                      )
                    : item.message.messageType === "ai" &&
                        item.message.streamStatus === "error"
                      ? <ErrorIndicator text={item.message.content} />
                    : item.message.content,
                role: item.message.messageType,
              }))}
              styles={{
                root: {
                  width: "100%",
                  marginInline: "auto",
                },
              }}
              role={bubbleRole}
            />
          </div>
        </Spin>
      </div>
    </div>
  )
}

export default ChatList
