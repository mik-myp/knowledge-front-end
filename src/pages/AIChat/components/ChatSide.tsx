import type { TChatSideProps } from "@/types/ai-chat"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  OpenAIOutlined,
} from "@ant-design/icons"
import Conversations from "@ant-design/x/es/conversations"
import { App, Button, Form, Input, Modal, Spin, theme } from "antd"
import { useState } from "react"
import { useNavigate } from "react-router"
import KnowledgeSelectModal from "./KnowledgeSelectModal"

/**
 * 渲染会话列表中的标题内容。
 * @param conversation 当前会话对象。
 * @param titleColor 标题文字颜色，可选。
 * @returns 返回会话标签对应的 JSX 结构。
 */
const renderConversationLabel = (
  conversation: TChatSideProps["conversations"][number],
  titleColor?: string
) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {conversation.knowledgeBaseId ? (
        <span className="shrink-0 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] text-sky-700">
          知识库
        </span>
      ) : null}
      <span
        className="min-w-0 flex-1 truncate"
        style={titleColor ? { color: titleColor } : undefined}
      >
        {conversation.title}
      </span>
      {conversation.isDraft ? (
        <span className="shrink-0 rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] text-amber-700">
          待发送
        </span>
      ) : null}
    </div>
  )
}

/**
 * 渲染对话侧栏组件。
 * @param props 组件属性。
 * @param props.conversations 会话列表。
 * @param props.activeConversationKey 有效会话Key。
 * @param props.setActiveConversationKey 设置有效会话Key。
 * @param props.onCreateConversation on创建会话。
 * @param props.onRenameConversation onRename会话。
 * @param props.onRemoveConversation on删除会话。
 * @param props.updatingConversation updating会话。
 * @param props.loading loading。
 * @returns 返回组件渲染结果。
 */
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
  const { modal } = App.useApp()
  const {
    token: { colorPrimary, colorPrimaryBg, colorSplit, lineType, lineWidth },
  } = theme.useToken()

  const [renameForm] = Form.useForm<{ title: string }>()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameConversationId, setRenameConversationId] = useState("")

  const activeConversationStyle = {
    backgroundColor: colorPrimaryBg,
    color: colorPrimary,
  }
  const isNewConversationActive = activeConversationKey === "new-conversation"

  const conversationItems = [
    {
      key: "new-conversation",
      label: (
        <span
          style={isNewConversationActive ? { color: colorPrimary } : undefined}
        >
          开始新的会话
        </span>
      ),
      icon: <OpenAIOutlined />,
      style: isNewConversationActive ? activeConversationStyle : undefined,
    },
    ...conversations.map((conversation) => {
      const isActive = conversation.key === activeConversationKey

      return {
        ...conversation,
        label: renderConversationLabel(
          conversation,
          isActive ? colorPrimary : undefined
        ),
        style: isActive ? activeConversationStyle : undefined,
      }
    }),
  ]

  const closeRenameModal = () => {
    setRenameOpen(false)
    setRenameConversationId("")
    renameForm.resetFields()
  }

  const handleConfirm = (knowledge?: TKnowledgeBaseRecord) => {
    onCreateConversation(knowledge)
    setOpen(false)
  }

  const handleRename = async (values: { title: string }) => {
    if (!renameConversationId) {
      return
    }

    await onRenameConversation(renameConversationId, values.title)
    closeRenameModal()
  }

  return (
    <div
      className="box-border flex h-full w-70 flex-col overflow-hidden px-3"
      style={{
        borderInlineEnd: `${lineWidth}px ${lineType} ${colorSplit}`,
      }}
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
            items={conversationItems}
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
                      renameForm.setFieldsValue({
                        title: String(conversation.title ?? conversation.label),
                      })
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
        onCancel={closeRenameModal}
        onOk={() => {
          renameForm.submit()
        }}
        confirmLoading={updatingConversation}
        destroyOnHidden
      >
        <Form form={renameForm} layout="vertical" onFinish={handleRename}>
          <Form.Item
            name="title"
            rules={[
              {
                required: true,
                min: 1,
                max: 50,
                type: "string",
                message: "会话标题不能为空，并且长度不能超过 50 个字符",
              },
            ]}
          >
            <Input placeholder="请输入新的会话标题" maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ChatSide
