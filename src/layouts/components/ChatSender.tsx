import { useStyles } from "@/lib/illustrationTheme"
import { OpenAIFilled } from "@ant-design/icons"
import { Sender, Suggestion } from "@ant-design/x"
import { Flex, type GetProp } from "antd"

type SuggestionItems = Exclude<GetProp<typeof Suggestion, "items">, () => void>

const ChatSender = () => {
  const { styles } = useStyles()

  const suggestions: SuggestionItems = [
    {
      label: "选择知识库",
      value: "knowledge",
      icon: <OpenAIFilled />,
      children: [
        {
          label: "About React",
          value: "react",
        },
        {
          label: "About Ant Design",
          value: "antd",
        },
      ],
    },
  ]

  return (
    <Flex vertical gap={12} align="center" className="mx-6">
      <Suggestion
        items={suggestions}
        onSelect={(itemVal) => {
          // setValue(`[${itemVal}]:`)
        }}
        rootClassName="w-full max-w-210"
      >
        {({ onTrigger, onKeyDown, open }) => {
          console.log(open, "suggestion open")
          return (
            <>
              <Sender
                // loading={loading}
                // value={value}
                onSubmit={(value) => {
                  // setValue("")
                  // setLoading(true)
                  // setTimeout(() => {
                  //   setLoading(false)
                  // }, 3000)
                }}
                onChange={(nextVal) => {
                  if (nextVal === "/") {
                    onTrigger()
                  } else if (!nextVal) {
                    onTrigger(false)
                  }
                  // setValue(nextVal)
                }}
                onKeyDown={onKeyDown}
                placeholder="输入 / 获取建议"
                classNames={{
                  input: styles.illustrationNoneBox,
                }}
              />
            </>
          )
        }}
      </Suggestion>
    </Flex>
  )
}

export default ChatSender
