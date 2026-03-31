import { Button, theme } from "antd"
import "@mdxeditor/editor/style.css"
import { useState } from "react"
import MarkdownEditor from "@/components/MarkdownEditor"

const AIWrite = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const [markdownContent, setMarkdownContent] = useState(`# Hlo World`)

  return (
    <div className="bg-white">
      <div
        style={{ background: colorBgContainer }}
        className="sticky top-0 z-10 pb-4"
      >
        <div className="flex h-15 items-center justify-between border-b border-black/6 px-4">
          <Button type="link">返回</Button>
        </div>
      </div>

      <div
        className="prose rounded-2xl px-4 pb-4"
        style={{
          maxWidth: "stretch",
        }}
      >
        <MarkdownEditor
          markdown={markdownContent}
          onChange={setMarkdownContent}
        />
      </div>
    </div>
  )
}

export default AIWrite
