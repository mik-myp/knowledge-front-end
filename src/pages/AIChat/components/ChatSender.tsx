import { useStyles } from "@/lib/illustrationTheme"
import type { TChatSenderProps } from "@/types/ai-chat"
import { Sender } from "@ant-design/x"
import { Flex } from "antd"
import { useState } from "react"

const ChatSender = ({ onSubmit, onAbort, isRequesting }: TChatSenderProps) => {
  const { styles } = useStyles()

  const [inputValue, setInputValue] = useState("")

  return (
    <Flex vertical gap={12} align="center" className="mx-6">
      <Sender
        rootClassName="w-full max-w-210"
        loading={isRequesting}
        value={inputValue}
        onChange={setInputValue}
        onSubmit={() => {
          const nextValue = inputValue.trim()

          if (!nextValue) {
            return
          }

          onSubmit(nextValue)
          setInputValue("")
        }}
        onCancel={onAbort}
        classNames={{
          input: styles.illustrationNoneBox,
        }}
      />
    </Flex>
  )
}

export default ChatSender
