/**
 * 定义对话消息类型的类型结构。
 */
export type TChatMessageType = "system" | "human" | "ai" | "tool"

/**
 * 定义问答请求消息角色的类型结构。
 */
export type TChatRequestMessageRole = "system" | "human" | "tool"

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
  text?: string
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
 * 定义创建会话参数结构。
 */
export type TCreateChatSessionInput = {
  knowledgeBaseId?: string
  title?: string
}

/**
 * 定义更新会话参数结构。
 */
export type TUpdateChatSessionInput = {
  id: string
  title: string
}

/**
 * 定义按 ID 删除会话参数结构。
 */
export type TChatSessionIdInput = {
  id: string
}

/**
 * 定义按会话查询消息参数结构。
 */
export type TFindChatMessagesQuery = {
  sessionId: string
}

/**
 * 定义单条问答消息参数结构。
 */
export type TChatAskMessage = {
  role: TChatRequestMessageRole
  content: string
  name?: string
  toolCallId?: string
}

/**
 * 定义对话问答请求的类型结构。
 */
export type TChatAskRequest = {
  messages: TChatAskMessage[]
  sessionId?: string
  knowledgeBaseId?: string
  topK?: number
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
