import type {
  TChatAskRequest,
  TChatAskResponse,
  TChatMessageRecord,
  TChatMessageSource,
  TChatMessageType,
} from "@/types/chat"
import { DefaultChatProvider } from "@ant-design/x-sdk"

/**
 * 创建消息对象。
 * @param params 参数对象。
 * @param params.id 资源 ID。
 * @param params.sessionId 会话 ID。
 * @param params.messageType 消息类型。
 * @param params.content 内容。
 * @param params.streamStatus 流式状态。
 * @param params.sequence 消息序号。
 * @param params.sources 来源信息列表。
 * @returns 返回对话消息记录。
 */
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

/**
 * 规范化响应数据。
 * @param response 响应对象。
 * @returns 返回对话问答响应或undefined。
 */
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

/**
 * 封装对话请求参数和流式消息转换逻辑。
 */
export default class ChatProvider extends DefaultChatProvider<
  TChatMessageRecord,
  TChatAskRequest,
  TChatAskResponse
> {
  /**
   * 将本地请求参数整理为接口可接受的格式。
   * @param requestParams 当前对话请求参数。
   * @returns 返回发送到后端前的标准化请求参数。
   */
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

  /**
   * 根据当前请求生成本地占位消息。
   * @param requestParams 当前对话请求参数。
   * @returns 返回用于立即渲染的本地消息记录。
   */
  transformLocalMessage(requestParams: Partial<TChatAskRequest>) {
    const firstMessage = requestParams.messages?.[0]

    return createMessage({
      id: `local-${Date.now()}`,
      sessionId: requestParams.sessionId ?? requestParams.localSessionId ?? "",
      messageType: firstMessage?.role ?? "human",
      content: firstMessage?.content ?? "",
    })
  }

  /**
   * 将流式响应分片转换为前端消息对象。
   * @param info 流式转换上下文。
   * @param info.originMessage 当前已存在的消息对象。
   * @param info.chunk 最新收到的响应分片。
   * @param info.chunks 已接收的全部响应分片。
   * @returns 返回适合渲染的最新消息记录。
   */
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
      response?.sessionId ??
      info.originMessage?.sessionId ??
      latestMessage?.sessionId ??
      ""

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
    const hasAnswerContent = Boolean(
      response.message?.content || response.answer
    )
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
