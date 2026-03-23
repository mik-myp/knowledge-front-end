import { theme } from "antd"
import ChatSide from "./components/ChatSide"
import ChatList from "./components/ChatList"
import ChatSender from "./components/ChatSender"
import {
  DefaultChatProvider,
  useXChat,
  useXConversations,
  XRequest,
} from "@ant-design/x-sdk"
import { useState } from "react"

interface ChatInput {
  query: string
}

const DEFAULT_CONVERSATIONS_ITEMS = [
  {
    key: "default-0",
    label: "会话0",
    group: "今天",
  },
  {
    key: "default-1",
    label: "会话1",
    group: "今天",
  },
  {
    key: "default-2",
    label: "会话2",
    group: "昨天",
  },
]
const AILayout = () => {
  const {
    token: { colorBgContainer, paddingLG },
  } = theme.useToken()

  const [provider] = useState(
    new DefaultChatProvider<string, ChatInput, string>({
      request: XRequest("https://api.example.com/chat", {
        manual: true,
      }),
    })
  )

  const {
    conversations,
    activeConversationKey,
    setActiveConversationKey,
    addConversation,
    setConversations,
  } = useXConversations({
    defaultConversations: DEFAULT_CONVERSATIONS_ITEMS,
    defaultActiveConversationKey: DEFAULT_CONVERSATIONS_ITEMS[0].key,
  })

  const { onRequest, messages, isRequesting, abort, onReload, setMessage } =
    useXChat({
      provider, // every conversation has its own provider
      // conversationKey: activeConversationKey,
      // defaultMessages: historyMessageFactory(activeConversationKey),
      // requestPlaceholder: () => {
      //   return {
      //     content: locale.noData,
      //     role: "assistant",
      //   }
      // },
      // requestFallback: (_, { error, errorInfo, messageInfo }) => {
      //   if (error.name === "AbortError") {
      //     return {
      //       content: messageInfo?.message?.content || locale.requestAborted,
      //       role: "assistant",
      //     }
      //   }
      //   return {
      //     content: errorInfo?.error?.message || locale.requestFailed,
      //     role: "assistant",
      //   }
      // },
    })

  return (
    <div
      className="flex h-screen w-full"
      style={{
        background: colorBgContainer,
      }}
    >
      <ChatSide
        conversations={conversations}
        activeConversationKey={activeConversationKey}
        setActiveConversationKey={setActiveConversationKey}
        addConversation={addConversation}
        setConversations={setConversations}
      />
      <div
        className="box-border flex h-full w-[calc(100%-280px)] flex-col justify-between"
        style={{
          paddingBlock: paddingLG,
        }}
      >
        <ChatList />
        <ChatSender />
      </div>
    </div>
  )
}

export default AILayout
