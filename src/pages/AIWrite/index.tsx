import { Button, theme } from "antd"
import "@mdxeditor/editor/style.css"
import { useState } from "react"
import MarkdownEditor from "@/components/MarkdownEditor"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

const AIWrite = () => {
  const { t } = useTranslation(["aiWrite", "common"])
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const navigate = useNavigate()

  const [markdownContent, setMarkdownContent] = useState(() =>
    t("editor.initialContent", { ns: "aiWrite" })
  )

  return (
    <div className="bg-white">
      <div
        style={{ background: colorBgContainer }}
        className="sticky top-0 z-10 pb-4"
      >
        <div className="flex h-15 items-center justify-between border-b border-black/6 px-4">
          <Button type="link" onClick={() => navigate(-1)}>
            {t("header.back", { ns: "aiWrite" })}
          </Button>
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
