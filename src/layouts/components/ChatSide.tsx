import { Conversations } from "@ant-design/x"
import { Button, theme } from "antd"
import { useNavigate } from "react-router"

const ChatSide = ({
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
  setConversations,
}) => {
  const {
    token: { colorBgLayout },
  } = theme.useToken()

  const navigate = useNavigate()

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
        主页面
      </Button>
      <Conversations
        items={conversations}
        creation={{
          onClick: () => {
            addConversation({
              key: Date.now().toString(),
              label: `会话${conversations.length + 1}`,
              group: "今天",
            })
          },
        }}
        // creation={{
        //   onClick: () => {
        //     if (messages.length === 0) {
        //       messageApi.error(locale.itIsNowANewConversation)
        //       return
        //     }
        //     const now = dayjs().valueOf().toString()
        //     addConversation({
        //       key: now,
        //       label: `${locale.newConversation} ${conversations.length + 1}`,
        //       group: locale.today,
        //     })
        //     setActiveConversationKey(now)
        //   },
        // }}
        // items={conversations.map(({ key, label, ...other }) => ({
        //   key,
        //   label:
        //     key === activeConversationKey
        //       ? `[${locale.curConversation}]${label}`
        //       : label,
        //   ...other,
        // }))}
        // className={styles.conversations}
        // activeKey={activeConversationKey}
        // onActiveChange={setActiveConversationKey}
        groupable
        // styles={{ item: { padding: "0 8px" } }}
        // menu={(conversation) => ({
        //   items: [
        //     {
        //       label: locale.rename,
        //       key: "rename",
        //       icon: <EditOutlined />,
        //     },
        //     {
        //       label: locale.delete,
        //       key: "delete",
        //       icon: <DeleteOutlined />,
        //       danger: true,
        //       onClick: () => {
        //         const newList = conversations.filter(
        //           (item) => item.key !== conversation.key
        //         )
        //         const newKey = newList?.[0]?.key
        //         setConversations(newList)
        //         if (conversation.key === activeConversationKey) {
        //           setActiveConversationKey(newKey)
        //         }
        //       },
        //     },
        //   ],
        // })}
      />
    </div>
  )
}

export default ChatSide
