import type { TChatConversationItem, TChatMessageRecord } from "@/types/chat"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"
import type React from "react"

/**
 * 定义对话列表消息Item的类型结构。
 */
export type TChatListMessageItem = {
  id: string | number
  message: TChatMessageRecord
  status?: "local" | "loading" | "updating" | "success" | "error" | "abort"
}

/**
 * 定义对话列表的属性结构。
 */
export type TChatListProps = {
  conversationKey: string
  messages: TChatListMessageItem[]
  messageLoading: boolean
}

/**
 * 定义对话发送器的属性结构。
 */
export type TChatSenderProps = {
  onSubmit: (value: string) => void
  onAbort: () => void
  isRequesting: boolean
}

/**
 * 定义对话侧栏的属性结构。
 */
export type TChatSideProps = {
  conversations: TChatConversationItem[]
  activeConversationKey: string
  setActiveConversationKey: (key: string) => void
  onCreateConversation: (knowledge?: TKnowledgeBaseRecord) => void
  onRenameConversation: (conversationId: string, title: string) => Promise<void>
  onRemoveConversation: (conversationId: string) => Promise<void>
  updatingConversation: boolean
  loading: boolean
}

/**
 * 定义知识库Select弹窗的属性结构。
 */
export type TKnowledgeSelectModalProps = {
  open: boolean
  onCancel: () => void
  onConfirm: (knowledge?: TKnowledgeBaseRecord) => void
  title?: string
  header?: React.ReactNode
  confirmLoading?: boolean
}
