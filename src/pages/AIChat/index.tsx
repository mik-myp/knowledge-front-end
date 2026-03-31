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
import { useTranslation } from "react-i18next"
import ChatProvider from "./chatProvider"
import ChatList from "./components/ChatList"
import ChatSender from "./components/ChatSender"
import ChatSide from "./components/ChatSide"

/**
 * 对话问答接口的完整请求地址。
 */
const chatAskStreamUrl = `${getRequestBaseURL()}/chat/ask-stream`

/**
 * 新建会话在前端侧栏中的固定标识。
 */
const NEW_CONVERSATION_KEY = "new-conversation"

/**
 * 本地草稿会话使用的键名前缀。
 */
const LOCAL_CONVERSATION_KEY_PREFIX = "local-conversation-"

/**
 * 判断是否为草稿会话Key。
 * @param key key。
 * @returns 返回布尔值，表示是否满足草稿会话Key。
 */
const isDraftConversationKey = (key?: string) =>
  Boolean(key?.startsWith(LOCAL_CONVERSATION_KEY_PREFIX))

/**
 * 判断是否为Ephemeral会话Key。
 * @param key key。
 * @returns 返回布尔值，表示是否满足Ephemeral会话Key。
 */
const isEphemeralConversationKey = (key?: string) =>
  key === NEW_CONVERSATION_KEY || isDraftConversationKey(key)

/**
 * 判断是否为Persisted会话Key。
 * @param key key。
 * @returns 返回布尔值，表示是否满足Persisted会话Key。
 */
const isPersistedConversationKey = (key?: string) =>
  Boolean(key && /^[a-f\d]{24}$/i.test(key))

/**
 * 根据消息内容生成会话标题。
 * @param value 用户输入的消息内容。
 * @returns 返回适合作为会话名称的标题文本。
 */
const buildConversationTitle = (value: string, fallbackTitle: string) => {
  const nextTitle = value.slice(0, 50)

  return nextTitle || fallbackTitle
}

/**
 * 生成对话请求错误提示。
 * @param error 错误对象。
 * @returns 返回字符串结果。
 */
const buildChatRequestErrorMessage = (
  error: Error,
  translate: (key: string) => string
): string => {
  if (error.name === "AbortError") {
    return translate("errors.abort")
  }

  const errorMessage = error.message.trim()

  if (errorMessage.includes("超时")) {
    return errorMessage
  }

  if (errorMessage.includes("status 504")) {
    return translate("errors.retrievalTimeout")
  }

  if (errorMessage.includes("status 502")) {
    return translate("errors.serviceUnavailable")
  }

  return errorMessage || translate("errors.failed")
}

/**
 * 创建用于解析 SSE 对话响应的转换器。
 * @returns 返回把文本分片转换为问答响应对象的 `TransformStream`。
 */
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

/**
 * 根据更新时间计算侧栏分组标题。
 * @param updatedAt 会话最后更新时间。
 * @returns 返回今天、昨天或具体日期分组名称。
 */
const getConversationGroup = (
  updatedAt: string,
  translate: (key: string) => string
) => {
  const updateTime = dayjs(updatedAt)

  if (updateTime.isSame(dayjs(), "day")) {
    return translate("group.today")
  }

  if (updateTime.isSame(dayjs().subtract(1, "day"), "day")) {
    return translate("group.yesterday")
  }

  return updateTime.format("MMM DD")
}

/**
 * 将会话记录转换为侧栏项。
 * @param session 会话对象。
 * @returns 返回对话会话Item。
 */
const toConversationItem = (
  session: TChatRecord,
  translate: (key: string) => string
): TChatConversationItem => {
  return {
    key: session.id,
    label: session.title,
    group: getConversationGroup(session.updatedAt, translate),
    title: session.title,
    knowledgeBaseId: session.knowledgeBaseId,
  }
}

/**
 * 按序号和创建时间整理消息顺序。
 * @param messages 原始消息列表。
 * @returns 返回排好序的消息列表副本。
 */
const sortMessages = (messages: TChatMessageRecord[]) => {
  return [...messages].sort((left, right) => {
    if (left.sequence !== right.sequence) {
      return left.sequence - right.sequence
    }

    return dayjs(left.createdAt).valueOf() - dayjs(right.createdAt).valueOf()
  })
}

/**
 * 将消息记录转换为默认消息列表。
 * @param messages 消息列表。
 * @returns 返回默认消息Info<TChat消息Record>列表。
 */
const toDefaultMessages = (
  messages: TChatMessageRecord[]
): DefaultMessageInfo<TChatMessageRecord>[] => {
  return sortMessages(messages).map((item) => ({
    id: item.id,
    status: "success",
    message: item,
  }))
}

/**
 * 渲染AIChat组件。
 * @returns 返回组件渲染结果。
 */
const AIChat = () => {
  const { t } = useTranslation("chat")
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
          const nextConversations = sessionList.map((item) =>
            toConversationItem(item, (key) => t(key))
          )

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
        chatAskStreamUrl,
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
        messageInfo?.message.sessionId ??
        activeConversationKeyRef.current ??
        "",
      messageType: "ai",
      content: buildChatRequestErrorMessage(error, (key) => t(key)),
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
      content: t("placeholder.thinking"),
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
            group: getConversationGroup(new Date().toISOString(), (key) =>
              t(key)
            ),
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
      try {
        const result = await loadConversationMessagesAsync(sessionId)
        hydratedMessagesRef.current.set(
          sessionId,
          toDefaultMessages(result.messages)
        )
      } catch {
        hydratedMessagesRef.current.delete(sessionId)
      }

      activeConversationKeyRef.current = sessionId

      if (draftKey && isDraftConversationKey(draftKey)) {
        setDraftConversations((currentDrafts) =>
          currentDrafts.filter((item) => item.key !== draftKey)
        )
      }

      setActiveConversationKey(sessionId)
      await loadSessionsAsync()
    }
  }, [
    loadConversationMessagesAsync,
    loadSessionsAsync,
    setActiveConversationKey,
  ])

  useEffect(() => {
    void loadSessionsAsync()
  }, [loadSessionsAsync, t])

  useEffect(() => {
    setDraftConversations((currentDrafts) =>
      currentDrafts.map((item) => ({
        ...item,
        group: t("group.draft"),
      }))
    )
  }, [t])

  const createDraftConversation = useCallback(
    (params: { knowledge?: TKnowledgeBaseRecord; title?: string }) => {
      const draftConversationKey = `${LOCAL_CONVERSATION_KEY_PREFIX}${Date.now()}`
      const title =
        params.title ||
        (params.knowledge?.name
          ? t("defaults.knowledgeConversation", { name: params.knowledge.name })
          : t("defaults.generalConversation"))
      const nextConversation: TChatConversationItem = {
        key: draftConversationKey,
        label: title,
        group: t("group.draft"),
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
    [setActiveConversationKey, t]
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
        message.info(
          knowledge?.name
            ? t("reuse.knowledge", { name: knowledge.name })
            : t("reuse.general")
        )
        return
      }

      createDraftConversation({
        knowledge,
        title: knowledge
          ? t("defaults.knowledgeConversation", { name: knowledge.name })
          : t("defaults.generalConversation"),
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
      if (isDraftConversationKey(conversationId)) {
        setDraftConversations((currentDrafts) =>
          currentDrafts.map((item) => {
            if (item.key !== conversationId) {
              return item
            }

            return {
              ...item,
              title,
              label: title,
            }
          })
        )
        return
      }

      await updateSessionAsync({
        id: conversationId,
        title,
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
        message.warning(t("errors.selectConversation"))
        return
      }

      const currentDraftConversation = draftConversations.find(
        (item) => item.key === activeConversationKey
      )

      if (activeConversationKey === NEW_CONVERSATION_KEY) {
        const nextDraftConversation = createDraftConversation({
          title: buildConversationTitle(value, t("defaults.generalConversation")),
        })

        queueRequest(nextDraftConversation.key, {
          localSessionId: nextDraftConversation.key,
          messages: [{ role: "human", content: value }],
        })
        return
      }

      if (currentDraftConversation) {
        if (currentDraftConversation.serverSessionId) {
          onRequest({
            sessionId: currentDraftConversation.serverSessionId,
            messages: [{ role: "human", content: value }],
          })
          return
        }

        onRequest({
          knowledgeBaseId:
            currentDraftConversation.knowledgeBaseId ?? undefined,
          localSessionId: currentDraftConversation.key,
          messages: [{ role: "human", content: value }],
        })
        return
      }

      onRequest({
        sessionId: activeConversationKey,
        messages: [{ role: "human", content: value }],
      })
    },
    [
      activeConversationKey,
      createDraftConversation,
      draftConversations,
      message,
      onRequest,
      queueRequest,
      t,
    ]
  )

  const centeredComposerTitle = activeDraftConversation?.knowledgeBaseId
    ? t("centeredComposer.knowledge.title")
    : t("centeredComposer.general.title")
  const centeredComposerDescription = activeDraftConversation?.knowledgeBaseName
    ? t("centeredComposer.knowledge.description", {
        name: activeDraftConversation.knowledgeBaseName,
      })
    : t("centeredComposer.general.description")

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
                conversationKey={activeConversationKey}
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
