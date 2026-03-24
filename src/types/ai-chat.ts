import type {
  TChatConversationItem,
  TChatMessageRecord,
} from "@/types/chat"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"

export type TChatListMessageItem = {
  id: string | number
  message: TChatMessageRecord
}

export type TChatListProps = {
  messages: TChatListMessageItem[]
  messageLoading: boolean
}

export type TChatSenderProps = {
  onSubmit: (value: string) => void
  onAbort: () => void
  isRequesting: boolean
}

export type TChatSideProps = {
  conversations: TChatConversationItem[]
  activeConversationKey: string
  setActiveConversationKey: (key: string) => void
  onCreateConversation: (knowledge?: TKnowledgeBaseRecord) => Promise<boolean>
  onRenameConversation: (conversationId: string, title: string) => Promise<void>
  onRemoveConversation: (conversationId: string) => Promise<void>
  creatingConversation: boolean
  updatingConversation: boolean
  loading: boolean
}

export type TKnowledgeSelectModalProps = {
  open: boolean
  onCancel: () => void
  onConfirm: (knowledge?: TKnowledgeBaseRecord) => void
  confirmLoading: boolean
}
