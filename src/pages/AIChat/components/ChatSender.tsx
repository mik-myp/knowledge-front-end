import { useStyles } from "@/lib/illustrationTheme"
import type { TChatSenderProps } from "@/types/ai-chat"
import { Flex } from "antd"
import { useState } from "react"
import Sender from "@ant-design/x/es/sender"

/**
 * 渲染对话发送器组件。
 * @param props 组件属性。
 * @param props.onSubmit onSubmit。
 * @param props.onAbort onAbort。
 * @param props.isRequesting isRequesting。
 * @returns 返回组件渲染结果。
 */
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
          if (!inputValue) {
            return
          }

          onSubmit(inputValue)
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
