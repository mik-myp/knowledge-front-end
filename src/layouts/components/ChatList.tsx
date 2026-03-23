import { Bubble, Welcome } from "@ant-design/x"
import { Flex, theme } from "antd"

const ChatList = ({ messages = [] }: {}) => {
  const {
    token: { paddingLG },
  } = theme.useToken()
  return (
    <div className="flex h-[calc(100%-120px)] w-full flex-col items-center">
      {messages?.length ? (
        /* 🌟 消息列表 */
        <Bubble.List
          // ref={listRef}
          items={messages?.map((i) => ({
            ...i.message,
            key: i.id,
            status: i.status,
            loading: i.status === "loading",
            extraInfo: i.extraInfo,
          }))}
          styles={{
            root: {
              maxWidth: 940,
            },
          }}
          // role={getRole(className)}
        />
      ) : (
        <Flex
          vertical
          style={{
            paddingInline: paddingLG,
          }}
          gap={16}
          align="center"
          className="box-border w-full max-w-210 pt-8"
        >
          <Welcome
            style={{
              width: "100%",
            }}
            variant="borderless"
            icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
            title={"你好，我是 Ant Design X"}
            description={
              "基于蚂蚁设计，AGI 产品界面解决方案，打造更好的智能视觉~~"
            }
          />
        </Flex>
      )}
    </div>
  )
}

export default ChatList
