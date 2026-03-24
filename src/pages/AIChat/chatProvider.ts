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
    sequence: params.sequence ?? 0,
    sources: params.sources,
    createdAt: now,
    updatedAt: now,
  }
}

export default class ChatProvider extends DefaultChatProvider<
  TChatMessageRecord,
  TChatAskRequest,
  TChatAskResponse
> {
  transformParams(requestParams: Partial<TChatAskRequest>) {
    return {
      sessionId: requestParams.sessionId ?? "",
      messages: requestParams.messages ?? [],
    }
  }

  transformLocalMessage(requestParams: Partial<TChatAskRequest>) {
    const firstMessage = requestParams.messages?.[0]

    return createMessage({
      id: `local-${Date.now()}`,
      sessionId: requestParams.sessionId ?? "",
      messageType: firstMessage?.role ?? "human",
      content: firstMessage?.content ?? "",
    })
  }

  transformMessage(info: {
    originMessage?: TChatMessageRecord
    chunk: TChatAskResponse
    chunks: TChatAskResponse[]
  }) {
    const latestMessage = this.getMessages().at(-1)
    const response = info.chunk ?? info.chunks[info.chunks.length - 1]
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
        })
      )
    }

    const content =
      response.message?.content ??
      response.answer ??
      info.originMessage?.content ??
      ""

    return createMessage({
      id:
        response.message?.id ??
        info.originMessage?.id ??
        `assistant-${Date.now()}`,
      sessionId,
      messageType: response.message?.messageType ?? "ai",
      content,
      sequence: response.message?.sequence ?? info.originMessage?.sequence ?? 0,
      sources:
        response.message?.sources ??
        response.sources ??
        info.originMessage?.sources,
    })
  }
}
