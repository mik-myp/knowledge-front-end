import type { TKnowledgeBaseRecord } from "@/types/knowledge"
import type { TChatSideProps } from "@/types/ai-chat"
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons"
import { Conversations } from "@ant-design/x"
import { App, Button, Input, Modal, Spin, theme } from "antd"
import { useState } from "react"
import { useNavigate } from "react-router"
import KnowledgeSelectModal from "./KnowledgeSelectModal"

const ChatSide = ({
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  onCreateConversation,
  onRenameConversation,
  onRemoveConversation,
  creatingConversation,
  updatingConversation,
  loading,
}: TChatSideProps) => {
  const {
    token: { colorBgLayout },
  } = theme.useToken()

  const { modal, message } = App.useApp()

  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameConversationId, setRenameConversationId] = useState("")
  const [renameTitle, setRenameTitle] = useState("")

  const handleConfirm = async (knowledge?: TKnowledgeBaseRecord) => {
    const success = await onCreateConversation(knowledge)

    if (success) {
      setOpen(false)
    }
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
      className="box-border flex h-full w-70 flex-col px-3"
      style={{
        background: `${colorBgLayout}80`,
      }}
    >
      <Button
        className="my-6 text-center text-xl"
        type="primary"
        onClick={() => navigate("/")}
      >
        首页
      </Button>
      <Spin spinning={loading} className="min-h-0 flex-1">
        <Conversations
          items={conversations}
          creation={{
            onClick: () => setOpen(true),
            label: "新建会话",
          }}
          activeKey={activeConversationKey}
          onActiveChange={setActiveConversationKey}
          groupable
          menu={(conversation) => ({
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
                    content: "删除后将同时清空该会话下的消息记录，是否继续？",
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
          })}
        />
      </Spin>
      <KnowledgeSelectModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
        confirmLoading={creatingConversation}
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
