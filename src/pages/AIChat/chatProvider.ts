import type {
  TChatAskRequest,
  TChatAskResponse,
  TChatMessageRecord,
  TChatMessageSource,
  TChatMessageType,
} from "@/types/chat"
import { DefaultChatProvider } from "@ant-design/x-sdk"

const createMessage = (params: {
  id: string
  sessionId: string
  messageType: TChatMessageType
  content: string
  streamStatus?: "progress" | "answer" | "error"
  sequence?: number
  sources?: TChatMessageSource[]
}): TChatMessageRecord => {
  const now = new Date().toISOString()

  return {
    id: params.id,
    userId: "",
    sessionId: params.sessionId,
    messageType: params.messageType,
    content: params.content,
    streamStatus: params.streamStatus,
    sequence: params.sequence ?? 0,
    sources: params.sources,
    createdAt: now,
    updatedAt: now,
  }
}

const normalizeResponse = (
  response?: TChatAskResponse | { data?: string }
): TChatAskResponse | undefined => {
  if (!response) {
    return undefined
  }

  if ("answer" in response && typeof response.answer === "string") {
    return response
  }

  if (!("data" in response) || typeof response.data !== "string") {
    return undefined
  }

  try {
    return JSON.parse(response.data) as TChatAskResponse
  } catch {
    return undefined
  }
}

export default class ChatProvider extends DefaultChatProvider<
  TChatMessageRecord,
  TChatAskRequest,
  TChatAskResponse
> {
  transformParams(requestParams: Partial<TChatAskRequest>) {
    const nextParams: Pick<TChatAskRequest, "messages"> & {
      sessionId?: string
      knowledgeBaseId?: string
    } = {
      messages: requestParams.messages ?? [],
    }

    if (requestParams.sessionId) {
      nextParams.sessionId = requestParams.sessionId
    }

    if (requestParams.knowledgeBaseId) {
      nextParams.knowledgeBaseId = requestParams.knowledgeBaseId
    }

    return {
      ...nextParams,
    }
  }

  transformLocalMessage(requestParams: Partial<TChatAskRequest>) {
    const firstMessage = requestParams.messages?.[0]

    return createMessage({
      id: `local-${Date.now()}`,
      sessionId:
        requestParams.sessionId ?? requestParams.localSessionId ?? "",
      messageType: firstMessage?.role ?? "human",
      content: firstMessage?.content ?? "",
    })
  }

  transformMessage(info: {
    originMessage?: TChatMessageRecord
    chunk: TChatAskResponse | { data?: string }
    chunks: Array<TChatAskResponse | { data?: string }>
  }) {
    const latestMessage = this.getMessages().at(-1)
    const response =
      normalizeResponse(info.chunk) ??
      normalizeResponse(info.chunks[info.chunks.length - 1])
    const sessionId =
      response?.sessionId ?? info.originMessage?.sessionId ?? latestMessage?.sessionId ?? ""

    if (!response) {
      return (
        info.originMessage ??
        createMessage({
          id: `assistant-${Date.now()}`,
          sessionId,
          messageType: "ai",
          content: "",
          streamStatus: "progress",
        })
      )
    }

    const content =
      response.error ||
      response.message?.content ||
      response.answer ||
      response.progress ||
      info.originMessage?.content ||
      ""
    const hasErrorContent = Boolean(response.error)
    const hasAnswerContent = Boolean(response.message?.content || response.answer)
    const hasProgressContent = Boolean(
      response.progress || info.originMessage?.streamStatus === "progress"
    )
    const streamStatus = hasErrorContent
      ? "error"
      : hasAnswerContent
      ? "answer"
      : hasProgressContent
        ? "progress"
        : undefined

    return createMessage({
      id:
        response.message?.id ??
        info.originMessage?.id ??
        `assistant-${Date.now()}`,
      sessionId,
      messageType: response.message?.messageType ?? "ai",
      content,
      streamStatus,
      sequence: response.message?.sequence ?? info.originMessage?.sequence ?? 0,
      sources:
        response.message?.sources ??
        response.sources ??
        info.originMessage?.sources,
    })
  }
}
