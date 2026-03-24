import { XMarkdown } from "@ant-design/x-markdown"
import "@ant-design/x-markdown/dist/x-markdown.css"
import type { TChatListProps } from "@/types/ai-chat"
import { Bubble } from "@ant-design/x"
import type { BubbleListProps } from "@ant-design/x/es/bubble"
import { Spin } from "antd"
import { useMemo } from "react"

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

const ChatList = ({ messages, messageLoading }: TChatListProps) => {
  const bubbleRole: BubbleListProps["role"] = useMemo(() => {
    return {
      ai: {
        placement: "start",
        typing: false,
        shape: "corner",
        contentRender: (content) =>
          renderMarkdownContent(String(content ?? "")),
      },
      human: {
        placement: "end",
        typing: false,
        shape: "corner",
      },
      system: {
        shape: "corner",
        variant: "borderless",
        contentRender: (content) =>
          renderMarkdownContent(String(content ?? "")),
      },
    }
  }, [])

  return (
    <div className="h-full w-full overflow-hidden">
      <Spin spinning={messageLoading} className="h-full w-full">
        <div className="scrollbar-thin h-full overflow-y-auto px-6">
          <div className="mx-auto w-full max-w-235">
            <Bubble.List
              items={messages.map((item) => ({
                key: item.id,
                content: item.message.content,
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
        </div>
      </Spin>
    </div>
  )
}

export default ChatList
