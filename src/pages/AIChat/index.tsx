import {
  createSession,
  findAllSession,
  getHistoryMessages,
  removeSession,
  updateSession,
} from "@/services/chat"
import { getAccessToken, getRequestBaseURL } from "@/lib/request"
import type {
  TChatAskRequest,
  TChatAskResponse,
  TChatConversationItem,
  TChatMessageRecord,
  TChatRecord,
} from "@/types/chat"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"
import {
  useXChat,
  useXConversations,
  XRequest,
  type DefaultMessageInfo,
} from "@ant-design/x-sdk"
import { useRequest } from "ahooks"
import { App, theme } from "antd"
import dayjs from "dayjs"
import { useCallback, useEffect, useRef, useState } from "react"
import ChatProvider from "./chatProvider"
import ChatList from "./components/ChatList"
import ChatSender from "./components/ChatSender"
import ChatSide from "./components/ChatSide"

const chatAskUrl = `${getRequestBaseURL()}/chat/ask`

const getConversationGroup = (updatedAt: string) => {
  const updateTime = dayjs(updatedAt)

  if (updateTime.isSame(dayjs(), "day")) {
    return "今天"
  }

  if (updateTime.isSame(dayjs().subtract(1, "day"), "day")) {
    return "昨天"
  }

  return updateTime.format("MMM DD")
}

const toConversationItem = (session: TChatRecord): TChatConversationItem => {
  return {
    key: session.id,
    label: session.knowledgeBaseId
      ? `[知识库] ${session.title}`
      : session.title,
    group: getConversationGroup(session.updatedAt),
    title: session.title,
    knowledgeBaseId: session.knowledgeBaseId,
  }
}

const sortMessages = (messages: TChatMessageRecord[]) => {
  return [...messages].sort((left, right) => {
    if (left.sequence !== right.sequence) {
      return left.sequence - right.sequence
    }

    return dayjs(left.createdAt).valueOf() - dayjs(right.createdAt).valueOf()
  })
}

const toDefaultMessages = (
  messages: TChatMessageRecord[]
): DefaultMessageInfo<TChatMessageRecord>[] => {
  return sortMessages(messages).map((item) => ({
    id: item.id,
    status: "success",
    message: item,
  }))
}

const AIChat = () => {
  const {
    token: { colorBgContainer, paddingLG },
  } = theme.useToken()

  const { message } = App.useApp()

  const {
    conversations,
    activeConversationKey,
    setActiveConversationKey,
    setConversations,
  } = useXConversations({
    defaultConversations: [],
    defaultActiveConversationKey: "",
  })

  const activeConversationKeyRef = useRef(activeConversationKey)
  const loadSessionsRef = useRef<(preferredKey?: string) => Promise<void>>(
    async () => {}
  )
  const syncMessagesRef = useRef<(sessionId: string) => Promise<void>>(
    async () => {}
  )

  const conversationItems = conversations as TChatConversationItem[]

  useEffect(() => {
    activeConversationKeyRef.current = activeConversationKey
  }, [activeConversationKey])

  const { runAsync: loadSessionsAsync, loading: conversationsLoading } =
    useRequest(
      async (preferredKey?: string) => {
        const sessionList = await findAllSession()

        return {
          preferredKey,
          sessionList,
        }
      },
      {
        manual: true,
        onSuccess: ({ preferredKey, sessionList }) => {
          const nextConversations = sessionList.map(toConversationItem)
          const currentConversationKey =
            preferredKey ?? activeConversationKeyRef.current
          const nextActiveConversationKey = nextConversations.some(
            (conversation) => conversation.key === currentConversationKey
          )
            ? currentConversationKey
            : (nextConversations[0]?.key ?? "")

          setConversations(nextConversations)
          setActiveConversationKey(nextActiveConversationKey)
        },
      }
    )

  const {
    runAsync: loadConversationMessagesAsync,
    loading: conversationMessagesLoading,
  } = useRequest(
    async (sessionId: string) => {
      const messages = await getHistoryMessages({
        sessionId,
      })

      return {
        sessionId,
        messages,
      }
    },
    {
      manual: true,
    }
  )

  const { runAsync: createSessionAsync, loading: creatingConversation } =
    useRequest(createSession, {
      manual: true,
    })

  const { runAsync: updateSessionAsync, loading: updatingConversation } =
    useRequest(updateSession, {
      manual: true,
    })

  const { runAsync: removeSessionAsync } = useRequest(removeSession, {
    manual: true,
  })

  const getHistoryMessageList = useCallback(
    async (info?: { conversationKey?: string }) => {
      if (!info?.conversationKey) {
        return []
      }

      try {
        const result = await loadConversationMessagesAsync(info.conversationKey)
        return toDefaultMessages(result.messages)
      } catch {
        return []
      }
    },
    [loadConversationMessagesAsync]
  )

  const [provider] = useState(
    new ChatProvider({
      request: XRequest<TChatAskRequest, TChatAskResponse, TChatMessageRecord>(
        chatAskUrl,
        {
          manual: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          fetch: (baseURL, options) => {
            const { body, method, signal, headers } = options

            return fetch(baseURL, {
              body,
              method,
              signal,
              headers: {
                ...headers,
                Authorization: `Bearer ${getAccessToken() ?? ""}`,
              },
            })
          },
          callbacks: {
            onSuccess: async (_, __, chatMessage) => {
              const currentConversationKey = activeConversationKeyRef.current
              const sessionId =
                chatMessage?.message.sessionId ?? currentConversationKey

              await loadSessionsRef.current(currentConversationKey || sessionId)

              if (sessionId && currentConversationKey === sessionId) {
                await syncMessagesRef.current(sessionId)
              }
            },
            onError: () => {
              /* empty */
            },
          },
        }
      ),
    })
  )

  const {
    parsedMessages,
    onRequest,
    isRequesting,
    abort: onAbort,
    setMessages,
    isDefaultMessagesRequesting,
  } = useXChat<
    TChatMessageRecord,
    TChatMessageRecord,
    TChatAskRequest,
    TChatAskResponse
  >({
    provider,
    conversationKey: activeConversationKey,
    defaultMessages: getHistoryMessageList,
  })

  const syncMessages = useCallback(
    async (sessionId: string) => {
      if (!sessionId) {
        return
      }

      try {
        const result = await loadConversationMessagesAsync(sessionId)

        if (activeConversationKeyRef.current !== result.sessionId) {
          return
        }

        setMessages(
          toDefaultMessages(result.messages).map((item) => ({
            id: item.id ?? `message-${Date.now()}`,
            status: item.status ?? "success",
            message: item.message,
          }))
        )
      } catch {
        if (activeConversationKeyRef.current === sessionId) {
          setMessages([])
        }
      }
    },
    [loadConversationMessagesAsync, setMessages]
  )

  useEffect(() => {
    loadSessionsRef.current = async (preferredKey?: string) => {
      await loadSessionsAsync(preferredKey)
    }
  }, [loadSessionsAsync])

  useEffect(() => {
    syncMessagesRef.current = async (sessionId: string) => {
      await syncMessages(sessionId)
    }
  }, [syncMessages])

  useEffect(() => {
    void loadSessionsAsync()
  }, [loadSessionsAsync])

  const handleCreateConversation = useCallback(
    async (knowledge?: TKnowledgeBaseRecord) => {
      try {
        const createdSession = await createSessionAsync({
          knowledgeBaseId: knowledge?.id,
          title: knowledge ? `${knowledge.name} 会话` : "新会话",
        })

        const nextConversation = toConversationItem(createdSession)

        setConversations([
          nextConversation,
          ...conversationItems.filter((item) => item.key !== createdSession.id),
        ])
        setActiveConversationKey(createdSession.id)
        setMessages([])

        return true
      } catch {
        return false
      }
    },
    [
      conversationItems,
      createSessionAsync,
      setActiveConversationKey,
      setConversations,
      setMessages,
    ]
  )

  const handleRenameConversation = useCallback(
    async (conversationId: string, title: string) => {
      await updateSessionAsync({
        id: conversationId,
        title,
      })

      await loadSessionsAsync(conversationId)
    },
    [loadSessionsAsync, updateSessionAsync]
  )

  const handleRemoveConversation = useCallback(
    async (conversationId: string) => {
      await removeSessionAsync({
        id: conversationId,
      })

      if (activeConversationKeyRef.current === conversationId) {
        setMessages([])
      }

      await loadSessionsAsync(
        activeConversationKeyRef.current === conversationId
          ? undefined
          : activeConversationKeyRef.current
      )
    },
    [loadSessionsAsync, removeSessionAsync, setMessages]
  )

  const handleSubmit = useCallback(
    (value: string) => {
      if (!value) {
        return
      }

      if (!activeConversationKey) {
        message.warning("请先新建会话")
        return
      }

      onRequest({
        sessionId: activeConversationKey,
        messages: [{ role: "human", content: value }],
      })
    },
    [activeConversationKey, message, onRequest]
  )

  const showCenteredComposer =
    parsedMessages.length === 0 &&
    !conversationMessagesLoading &&
    !isDefaultMessagesRequesting

  return (
    <div
      className="flex h-screen w-full"
      style={{
        background: colorBgContainer,
      }}
    >
      <ChatSide
        conversations={conversationItems}
        activeConversationKey={activeConversationKey}
        setActiveConversationKey={setActiveConversationKey}
        onCreateConversation={handleCreateConversation}
        onRenameConversation={handleRenameConversation}
        onRemoveConversation={handleRemoveConversation}
        creatingConversation={creatingConversation}
        updatingConversation={updatingConversation}
        loading={conversationsLoading}
      />
      <div
        className="box-border flex h-full w-[calc(100%-280px)] flex-col"
        style={{
          paddingBlock: paddingLG,
        }}
      >
        {showCenteredComposer ? (
          <div className="flex min-h-0 flex-1 items-center justify-center px-6">
            <div className="w-full max-w-210">
              <div className="mb-10 text-center">
                <div className="text-4xl font-semibold tracking-tight text-black">
                  开启新对话
                </div>
                <div className="mt-4 text-sm leading-7 text-black/45">
                  你可以直接提问，也可以在左侧新建知识库会话后开始问答。
                </div>
              </div>
              <ChatSender
                onSubmit={handleSubmit}
                isRequesting={isRequesting}
                onAbort={onAbort}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1">
              <ChatList
                messages={parsedMessages}
                messageLoading={
                  isDefaultMessagesRequesting || conversationMessagesLoading
                }
              />
            </div>
            <ChatSender
              onSubmit={handleSubmit}
              isRequesting={isRequesting}
              onAbort={onAbort}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default AIChat
