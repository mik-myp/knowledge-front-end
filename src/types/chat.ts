export type TChatMessageType = "system" | "human" | "ai" | "tool"

export type TChatRecord = {
  id: string
  userId: string
  knowledgeBaseId?: string | null
  title: string
  createdAt: string
  updatedAt: string
}

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

export type TChatMessageSource = {
  documentId: string
  documentName: string
  chunkSequence: number
  page?: number
  startIndex?: number
  endIndex?: number
  score?: number
}

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

export type TChatAskMessage = {
  role: TChatMessageType
  content: string
}

export type TChatAskRequest = {
  sessionId?: string
  knowledgeBaseId?: string
  localSessionId?: string
  messages: TChatAskMessage[]
}

export type TChatAskResponse = {
  sessionId: string
  answer: string
  progress?: string
  error?: string
  message?: TChatMessageRecord
  sources?: TChatMessageSource[]
  done?: boolean
}
