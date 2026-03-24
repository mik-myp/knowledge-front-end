import {
  findAllSession,
  getHistoryMessages,
  removeSession,
  updateSession,
} from "@/services/chat"
import { authorizedFetch, getRequestBaseURL } from "@/lib/request"
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
const NEW_CONVERSATION_KEY = "new-conversation"
const LOCAL_CONVERSATION_KEY_PREFIX = "local-conversation-"

const isDraftConversationKey = (key?: string) =>
  Boolean(key?.startsWith(LOCAL_CONVERSATION_KEY_PREFIX))

const isEphemeralConversationKey = (key?: string) =>
  key === NEW_CONVERSATION_KEY || isDraftConversationKey(key)

const isPersistedConversationKey = (key?: string) =>
  Boolean(key && /^[a-f\d]{24}$/i.test(key))

const buildConversationTitle = (value: string) => {
  const nextTitle = value.trim().replace(/\s+/g, " ").slice(0, 50)

  return nextTitle || "普通会话"
}

const buildConversationReuseMessage = (
  knowledge?: TKnowledgeBaseRecord
): string => {
  if (knowledge?.name) {
    return `已存在知识库「${knowledge.name}」的待开始会话，已切换过去`
  }

  return "已存在待开始的普通会话，已切换过去"
}

const buildChatRequestErrorMessage = (error: Error): string => {
  if (error.name === "AbortError") {
    return "已停止生成回答"
  }

  const errorMessage = error.message.trim()

  if (errorMessage.includes("超时")) {
    return errorMessage
  }

  if (errorMessage.includes("status 504")) {
    return "知识库检索超时，请稍后重试"
  }

  if (errorMessage.includes("status 502")) {
    return "知识库服务暂时不可用，请稍后重试"
  }

  return errorMessage || "本次问答处理失败，请稍后重试"
}

const createChatAskStreamTransform = () => {
  let buffer = ""

  return new TransformStream<string, TChatAskResponse>({
    transform(chunk, controller) {
      buffer += chunk

      const events = buffer.split("\n\n")
      buffer = events.pop() ?? ""

      for (const event of events) {
        const lines = event
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)

        const dataLine = lines.find((line) => line.startsWith("data:"))

        if (!dataLine) {
          continue
        }

        const payload = dataLine.slice(5).trim()

        if (!payload) {
          continue
        }

        try {
          controller.enqueue(JSON.parse(payload) as TChatAskResponse)
        } catch {
          continue
        }
      }
    },
    flush(controller) {
      const remaining = buffer.trim()

      if (!remaining) {
        return
      }

      const dataLine = remaining
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.startsWith("data:"))

      if (!dataLine) {
        return
      }

      const payload = dataLine.slice(5).trim()

      if (!payload) {
        return
      }

      try {
        controller.enqueue(JSON.parse(payload) as TChatAskResponse)
      } catch {
        /* empty */
      }
    },
  })
}

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
    label: session.title,
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
  const hydratedMessagesRef = useRef<
    Map<string, DefaultMessageInfo<TChatMessageRecord>[]>
  >(new Map())

  const {
    conversations,
    activeConversationKey,
    setActiveConversationKey,
    setConversations,
  } = useXConversations({
    defaultConversations: [],
    defaultActiveConversationKey: NEW_CONVERSATION_KEY,
  })
  const [draftConversations, setDraftConversations] = useState<
    TChatConversationItem[]
  >([])

  const activeConversationKeyRef = useRef(activeConversationKey)
  const completeDraftConversationRef = useRef<
    (draftKey: string | undefined, sessionId: string) => Promise<void>
  >(async () => {})
  const promoteDraftConversationRef = useRef<
    (draftKey: string | undefined, sessionId: string) => void
  >(() => {})

  const persistedConversationItems = conversations as TChatConversationItem[]
  const conversationItems = [
    ...draftConversations,
    ...persistedConversationItems,
  ]
  const activeDraftConversation = draftConversations.find(
    (item) => item.key === activeConversationKey
  )

  useEffect(() => {
    activeConversationKeyRef.current = activeConversationKey
  }, [activeConversationKey])

  const { runAsync: loadSessionsAsync, loading: conversationsLoading } =
    useRequest(
      async () => {
        const sessionList = await findAllSession()

        return {
          sessionList,
        }
      },
      {
        manual: true,
        onSuccess: ({ sessionList }) => {
          const nextConversations = sessionList.map(toConversationItem)

          setConversations(nextConversations)
          setDraftConversations((currentDrafts) =>
            currentDrafts.filter(
              (item) =>
                !nextConversations.some((nextItem) => nextItem.key === item.key)
            )
          )
        },
      }
    )

  const {
    runAsync: loadConversationMessagesAsync,
    loading: conversationMessagesLoading,
  } = useRequest(
    async (sessionId: string) => {
      if (!isPersistedConversationKey(sessionId)) {
        return {
          sessionId,
          messages: [],
        }
      }

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

  const { runAsync: updateSessionAsync, loading: updatingConversation } =
    useRequest(updateSession, {
      manual: true,
    })

  const { runAsync: removeSessionAsync } = useRequest(removeSession, {
    manual: true,
  })

  const getHistoryMessageList = useCallback(
    async (info?: { conversationKey?: string }) => {
      if (
        !info?.conversationKey ||
        isEphemeralConversationKey(info.conversationKey)
      ) {
        return []
      }

      const hydratedMessages = hydratedMessagesRef.current.get(
        info.conversationKey
      )

      if (hydratedMessages) {
        hydratedMessagesRef.current.delete(info.conversationKey)
        return hydratedMessages
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
            Accept: "text/event-stream",
            "Content-Type": "application/json",
          },
          transformStream: createChatAskStreamTransform,
          fetch: (baseURL, options) => {
            return authorizedFetch(baseURL, {
              body: options.body,
              method: options.method,
              signal: options.signal,
              headers: options.headers,
            })
          },
          callbacks: {
            onUpdate: (chunk) => {
              const currentConversationKey = activeConversationKeyRef.current

              if (!isEphemeralConversationKey(currentConversationKey)) {
                return
              }

              if (!chunk.sessionId) {
                return
              }

              promoteDraftConversationRef.current(
                currentConversationKey,
                chunk.sessionId
              )
            },
            onSuccess: async (_, __, chatMessage) => {
              const currentConversationKey = activeConversationKeyRef.current
              const sessionId =
                chatMessage?.message.sessionId ?? currentConversationKey

              if (!sessionId) {
                return
              }

              if (isEphemeralConversationKey(currentConversationKey)) {
                await completeDraftConversationRef.current(
                  currentConversationKey,
                  sessionId
                )
                return
              }

              await loadSessionsAsync()
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
    messages,
    parsedMessages,
    onRequest,
    queueRequest,
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
    requestFallback: (_, { error, messageInfo }) => ({
      id: `fallback-${Date.now()}`,
      userId: "",
      sessionId:
        messageInfo?.message.sessionId ?? activeConversationKeyRef.current ?? "",
      messageType: "ai",
      content: buildChatRequestErrorMessage(error),
      streamStatus: "error",
      sequence: messageInfo?.message.sequence ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    requestPlaceholder: (requestParams) => ({
      id: `placeholder-${Date.now()}`,
      userId: "",
      sessionId: requestParams.sessionId ?? requestParams.localSessionId ?? "",
      messageType: "ai",
      content: "正在思考中...",
      streamStatus: "progress",
      sequence: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  })

  useEffect(() => {
    promoteDraftConversationRef.current = (
      draftKey: string | undefined,
      sessionId: string
    ) => {
      if (!draftKey || !isDraftConversationKey(draftKey)) {
        return
      }

      setDraftConversations((currentDrafts) =>
        currentDrafts.map((item) => {
          if (item.key !== draftKey) {
            return item
          }

          return {
            ...item,
            isDraft: false,
            serverSessionId: sessionId,
            group: getConversationGroup(new Date().toISOString()),
            label: item.title,
          }
        })
      )
    }
  }, [])

  useEffect(() => {
    completeDraftConversationRef.current = async (
      draftKey: string | undefined,
      sessionId: string
    ) => {
      hydratedMessagesRef.current.set(
        sessionId,
        messages.map((item) => ({
          id: item.id,
          status: item.status,
          message: item.message,
        }))
      )

      activeConversationKeyRef.current = sessionId

      if (draftKey && isDraftConversationKey(draftKey)) {
        setDraftConversations((currentDrafts) =>
          currentDrafts.filter((item) => item.key !== draftKey)
        )
      }

      setActiveConversationKey(sessionId)
      await loadSessionsAsync()
    }
  }, [loadSessionsAsync, messages, setActiveConversationKey])

  useEffect(() => {
    void loadSessionsAsync()
  }, [loadSessionsAsync])

  const createDraftConversation = useCallback(
    (params: { knowledge?: TKnowledgeBaseRecord; title?: string }) => {
      const draftConversationKey = `${LOCAL_CONVERSATION_KEY_PREFIX}${Date.now()}`
      const title =
        params.title?.trim() || `${params.knowledge?.name ?? "普通"}会话`
      const nextConversation: TChatConversationItem = {
        key: draftConversationKey,
        label: title,
        group: "待开始",
        title,
        knowledgeBaseId: params.knowledge?.id,
        knowledgeBaseName: params.knowledge?.name,
        isDraft: true,
      }

      setDraftConversations((currentDrafts) => [
        nextConversation,
        ...currentDrafts.filter((item) => item.key !== draftConversationKey),
      ])
      setActiveConversationKey(draftConversationKey)
      return nextConversation
    },
    [setActiveConversationKey]
  )

  const handleCreateConversation = useCallback(
    (knowledge?: TKnowledgeBaseRecord) => {
      const existingDraftConversation = draftConversations.find((item) => {
        if (!item.isDraft || item.serverSessionId) {
          return false
        }

        if (knowledge?.id) {
          return item.knowledgeBaseId === knowledge.id
        }

        return !item.knowledgeBaseId
      })

      if (existingDraftConversation) {
        setActiveConversationKey(existingDraftConversation.key)
        message.info(buildConversationReuseMessage(knowledge))
        return
      }

      createDraftConversation({
        knowledge,
        title: knowledge ? `${knowledge.name} 会话` : "普通会话",
      })
    },
    [
      createDraftConversation,
      draftConversations,
      message,
      setActiveConversationKey,
    ]
  )

  const handleRenameConversation = useCallback(
    async (conversationId: string, title: string) => {
      const nextTitle = title.trim()

      if (isDraftConversationKey(conversationId)) {
        setDraftConversations((currentDrafts) =>
          currentDrafts.map((item) => {
            if (item.key !== conversationId) {
              return item
            }

            return {
              ...item,
              title: nextTitle,
              label: nextTitle,
            }
          })
        )
        return
      }

      await updateSessionAsync({
        id: conversationId,
        title: nextTitle,
      })

      await loadSessionsAsync()
    },
    [loadSessionsAsync, updateSessionAsync]
  )

  const handleRemoveConversation = useCallback(
    async (conversationId: string) => {
      if (isDraftConversationKey(conversationId)) {
        setDraftConversations((currentDrafts) =>
          currentDrafts.filter((item) => item.key !== conversationId)
        )

        if (activeConversationKeyRef.current === conversationId) {
          setActiveConversationKey(NEW_CONVERSATION_KEY)
          setMessages([])
        }

        return
      }

      await removeSessionAsync({
        id: conversationId,
      })

      if (activeConversationKeyRef.current === conversationId) {
        setMessages([])
        setActiveConversationKey(NEW_CONVERSATION_KEY)
      }

      await loadSessionsAsync()
    },
    [
      loadSessionsAsync,
      removeSessionAsync,
      setActiveConversationKey,
      setMessages,
    ]
  )

  const handleSubmit = useCallback(
    (value: string) => {
      if (!value) {
        return
      }

      if (!activeConversationKey) {
        message.warning("请先选择会话")
        return
      }

      const trimmedValue = value.trim()
      const currentDraftConversation = draftConversations.find(
        (item) => item.key === activeConversationKey
      )

      if (activeConversationKey === NEW_CONVERSATION_KEY) {
        const nextDraftConversation = createDraftConversation({
          title: buildConversationTitle(trimmedValue),
        })

        queueRequest(nextDraftConversation.key, {
          localSessionId: nextDraftConversation.key,
          messages: [{ role: "human", content: trimmedValue }],
        })
        return
      }

      if (currentDraftConversation) {
        if (currentDraftConversation.serverSessionId) {
          onRequest({
            sessionId: currentDraftConversation.serverSessionId,
            messages: [{ role: "human", content: trimmedValue }],
          })
          return
        }

        onRequest({
          knowledgeBaseId:
            currentDraftConversation.knowledgeBaseId ?? undefined,
          localSessionId: currentDraftConversation.key,
          messages: [{ role: "human", content: trimmedValue }],
        })
        return
      }

      onRequest({
        sessionId: activeConversationKey,
        messages: [{ role: "human", content: trimmedValue }],
      })
    },
    [
      activeConversationKey,
      createDraftConversation,
      draftConversations,
      message,
      onRequest,
      queueRequest,
    ]
  )

  const centeredComposerTitle = activeDraftConversation?.knowledgeBaseId
    ? "开启知识库对话"
    : "开启新对话"
  const centeredComposerDescription = activeDraftConversation?.knowledgeBaseName
    ? `当前会话将关联知识库「${activeDraftConversation.knowledgeBaseName}」，发送首条消息后才会真正创建会话。`
    : "你可以直接提问，也可以在左侧新建知识库会话后开始问答。"

  const shouldShowMessageLoading =
    (isDefaultMessagesRequesting || conversationMessagesLoading) &&
    parsedMessages.length === 0

  const showCenteredComposer =
    isEphemeralConversationKey(activeConversationKey) &&
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
                  {centeredComposerTitle}
                </div>
                <div className="mt-4 text-sm leading-7 text-black/45">
                  {centeredComposerDescription}
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
                messageLoading={shouldShowMessageLoading}
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
