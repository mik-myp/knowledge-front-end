import type { TChatListProps } from "@/types/ai-chat"
import type { TChatMessageRecord } from "@/types/chat"
import Markdown from "@/components/Markdown"
import { Bubble, type BubbleListProps } from "@ant-design/x"
import type { GetRef } from "antd"
import { Spin } from "antd"
import { useEffect, useMemo, useRef } from "react"
import ActionsFooter from "./ActionsFooter"

/**
 * 显示 AI 正在流式生成内容时的状态提示。
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
 * 显示 AI 回复失败时的错误信息。
 */
const ErrorIndicator = ({ text }: { text?: string }) => {
  return <div className="text-sm leading-7 text-red-500">{text}</div>
}

const isAiProgressMessage = (
  messageItem?: TChatListProps["messages"][number]
) => {
  return Boolean(
    messageItem &&
    messageItem.message.messageType === "ai" &&
    (messageItem.status === "loading" || messageItem.status === "updating") &&
    messageItem.message.streamStatus === "progress"
  )
}

const isAiStreamingMessage = (
  messageItem?: TChatListProps["messages"][number]
) => {
  return Boolean(
    messageItem &&
    messageItem.message.messageType === "ai" &&
    (messageItem.status === "loading" || messageItem.status === "updating") &&
    messageItem.message.streamStatus !== "error"
  )
}

const isAiCompleteMessage = (
  messageItem?: TChatListProps["messages"][number]
) => {
  return Boolean(
    messageItem &&
    messageItem.message.messageType === "ai" &&
    messageItem.status === "success"
  )
}

const mapBubbleRole = (messageType: TChatMessageRecord["messageType"]) => {
  if (messageType === "human") {
    return "user"
  }

  if (messageType === "system") {
    return "system"
  }

  return "ai"
}

/**
 * 渲染对话消息列表，并在消息变化后自动滚动到底部。
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
      ai: (item) => {
        const messageItem = item.extraInfo as TChatListProps["messages"][number]

        return {
          placement: "start",
          typing: false,
          streaming: isAiStreamingMessage(messageItem),
          shape: "corner",
          loading: isAiProgressMessage(messageItem),
          loadingRender: () => {
            return (
              <ThinkingIndicator
                text={messageItem.message.content || "正在生成回答"}
              />
            )
          },
          contentRender: () => {
            if (messageItem.message.streamStatus === "error") {
              return <ErrorIndicator text={messageItem.message.content} />
            }

            return (
              <Markdown
                content={messageItem.message.content}
                streaming={
                  isAiStreamingMessage(messageItem)
                    ? {
                        hasNextChunk: true,
                        enableAnimation: true,
                      }
                    : undefined
                }
              />
            )
          },
          footer: () => {
            if (isAiCompleteMessage(messageItem)) {
              return <ActionsFooter messageItem={messageItem} />
            }

            return null
          },
        }
      },
      user: {
        placement: "end",
        typing: false,
        shape: "corner",
      },
      system: {
        shape: "corner",
        variant: "borderless",
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
              content: item.message.content,
              role: mapBubbleRole(item.message.messageType),
              status: item.status,
              extraInfo: item,
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
