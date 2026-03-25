import type {
  AskChatInput,
  AskChatMessageInput,
} from "@/contracts/api-contracts"

/**
 * 定义对话消息类型的类型结构。
 */
export type TChatMessageType = "system" | "human" | "ai" | "tool"

/**
 * 定义对话的数据记录结构。
 */
export type TChatRecord = {
  id: string
  userId: string
  knowledgeBaseId?: string | null
  title: string
  createdAt: string
  updatedAt: string
}

/**
 * 定义对话会话Item的类型结构。
 */
export type TChatConversationItem = {
  key: string
  label: string
  group: string
  title: string
  knowledgeBaseId?: string | null
  knowledgeBaseName?: string
  isDraft?: boolean
  serverSessionId?: string
}

/**
 * 定义对话消息来源的类型结构。
 */
export type TChatMessageSource = {
  documentId: string
  documentName: string
  chunkSequence: number
  page?: number
  startIndex?: number
  endIndex?: number
  score?: number
}

/**
 * 定义对话消息的数据记录结构。
 */
export type TChatMessageRecord = {
  id: string
  userId: string
  sessionId: string
  messageType: TChatMessageType
  content: string
  streamStatus?: "progress" | "answer" | "error"
  sequence: number
  name?: string
  toolCallId?: string
  toolCalls?: {
    id?: string
    name: string
    args: Record<string, unknown>
  }[]
  responseMetadata?: Record<string, unknown>
  usageMetadata?: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
    input_token_details?: Record<string, unknown>
    output_token_details?: Record<string, unknown>
  }
  sources?: TChatMessageSource[]
  createdAt: string
  updatedAt: string
}

/**
 * 定义对话问答消息的类型结构。
 */
export type TChatAskMessage = AskChatMessageInput

/**
 * 定义对话问答请求的类型结构。
 */
export type TChatAskRequest = AskChatInput & {
  localSessionId?: string
}

/**
 * 定义对话问答响应的类型结构。
 */
export type TChatAskResponse = {
  sessionId: string
  answer: string
  progress?: string
  error?: string
  message?: TChatMessageRecord
  sources?: TChatMessageSource[]
  done?: boolean
}
