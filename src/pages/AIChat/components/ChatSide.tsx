import type { TKnowledgeBaseRecord } from "@/types/knowledge"
import type { TChatSideProps } from "@/types/ai-chat"
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  OpenAIOutlined,
} from "@ant-design/icons"
import { Conversations } from "@ant-design/x"
import { App, Button, Input, Modal, Spin } from "antd"
import { useState } from "react"
import { useNavigate } from "react-router"
import KnowledgeSelectModal from "./KnowledgeSelectModal"
import { cn } from "@/lib/utils"

const renderConversationLabel = (
  conversation: TChatSideProps["conversations"][number]
) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {conversation.knowledgeBaseId ? (
        <span className="shrink-0 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] text-sky-700">
          知识库
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
      {conversation.isDraft ? (
        <span className="shrink-0 rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] text-amber-700">
          待发送
        </span>
      ) : null}
    </div>
  )
}

const ChatSide = ({
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  onCreateConversation,
  onRenameConversation,
  onRemoveConversation,
  updatingConversation,
  loading,
}: TChatSideProps) => {
  const { modal, message } = App.useApp()

  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameConversationId, setRenameConversationId] = useState("")
  const [renameTitle, setRenameTitle] = useState("")

  const handleConfirm = (knowledge?: TKnowledgeBaseRecord) => {
    onCreateConversation(knowledge)
    setOpen(false)
  }

  const handleRename = async () => {
    const nextTitle = renameTitle.trim()

    if (!nextTitle || !renameConversationId) {
      message.warning("请输入会话标题")
      return
    }

    await onRenameConversation(renameConversationId, nextTitle)
    setRenameOpen(false)
    setRenameConversationId("")
    setRenameTitle("")
  }

  return (
    <div
      className={cn(
        "box-border flex h-full w-70 flex-col overflow-hidden px-3",
        "[border-inline-end-width:var(--ant-menu-active-bar-border-width)]",
        "[border-inline-end-style:var(--ant-line-type)]",
        "border-e-(--ant-color-split)"
      )}
    >
      <Button
        className="my-6 shrink-0 text-center text-xl"
        type="primary"
        onClick={() => navigate("/")}
      >
        首页
      </Button>
      <div className="min-h-0 flex-1 overflow-hidden">
        <Spin spinning={loading} className="block h-full">
          <Conversations
            className="h-full overflow-y-auto"
            styles={{
              root: {
                height: "100%",
              },
            }}
            classNames={{
              item: "[&.ant-conversations-item-active]:bg-[var(--ant-menu-item-selected-bg)] [&.ant-conversations-item-active]:text-[var(--ant-menu-item-selected-color)] [&.ant-conversations-item-active_.ant-conversations-label]:text-[var(--ant-menu-item-selected-color)]",
            }}
            items={[
              {
                key: "new-conversation",
                label: "开始新的会话",
                icon: <OpenAIOutlined />,
              },
              ...conversations.map((conversation) => ({
                ...conversation,
                label: renderConversationLabel(conversation),
              })),
            ]}
            creation={{
              onClick: () => setOpen(true),
              label: "新建会话",
            }}
            activeKey={activeConversationKey}
            onActiveChange={setActiveConversationKey}
            groupable
            menu={(conversation) => {
              if (conversation.key === "new-conversation") return undefined

              return {
                items: [
                  {
                    key: "rename",
                    label: "重命名",
                    icon: <EditOutlined />,
                    onClick: () => {
                      setRenameConversationId(String(conversation.key))
                      setRenameTitle(
                        String(conversation.title ?? conversation.label)
                      )
                      setRenameOpen(true)
                    },
                  },
                  {
                    key: "delete",
                    label: "删除会话",
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => {
                      modal.confirm({
                        title: "删除会话",
                        icon: <ExclamationCircleFilled />,
                        content:
                          "删除后将同时清空该会话下的消息记录，是否继续？",
                        okText: "删除",
                        okButtonProps: {
                          danger: true,
                        },
                        cancelText: "取消",
                        onOk: async () => {
                          await onRemoveConversation(String(conversation.key))
                        },
                      })
                    },
                  },
                ],
              }
            }}
          />
        </Spin>
      </div>
      <KnowledgeSelectModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
      <Modal
        open={renameOpen}
        title="重命名会话"
        onCancel={() => {
          setRenameOpen(false)
          setRenameConversationId("")
          setRenameTitle("")
        }}
        onOk={() => {
          void handleRename()
        }}
        confirmLoading={updatingConversation}
        destroyOnHidden
      >
        <Input
          value={renameTitle}
          onChange={(event) => setRenameTitle(event.target.value)}
          placeholder="请输入新的会话标题"
          maxLength={50}
        />
      </Modal>
    </div>
  )
}

export default ChatSide
