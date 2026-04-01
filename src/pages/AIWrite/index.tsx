import { useState } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Button, Form, Input, Select, Slider, Space, theme } from "antd"
import "@mdxeditor/editor/style.css"
import MarkdownEditor from "@/components/MarkdownEditor"
import { useStyles } from "@/lib/illustrationTheme"
import { cn } from "@/lib/utils"
import { useAIWrite, type TAIWriteConfig } from "@/stores/useAIWrite"

const AIWrite = () => {
  const { t } = useTranslation("aiWrite")
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const { styles } = useStyles()
  const navigate = useNavigate()
  const { writeConfig, setWriteConfig, resetWriteConfig } = useAIWrite()

  const [form] = Form.useForm<TAIWriteConfig>()
  const [markdownContent, setMarkdownContent] = useState("")

  const handleValuesChange = (_: unknown, allValues: TAIWriteConfig) => {
    setWriteConfig(allValues)
  }

  const handleReset = () => {
    resetWriteConfig()
    form.resetFields()
  }

  const handleStartWrite = () => {
    form.validateFields().then((values) => {
      console.log("🚀 ~ index.tsx:36 ~ handleGeneratePrompt ~ values:", values)
    })
  }

  const handleSubmit = () => {}

  return (
    <div className="bg-white">
      <div style={{ background: colorBgContainer }}>
        <div className="flex h-20 items-center justify-between border-b border-black/6 px-4">
          <Button type="link" onClick={() => navigate(-1)}>
            {t("header.back")}
          </Button>
          <Space size="middle">
            <Button onClick={handleReset}>{t("actions.reset")}</Button>
            <Button type="primary" onClick={handleStartWrite}>
              开始写作
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          </Space>
        </div>
      </div>

      <div className="flex w-full gap-4">
        <div className="h-[calc(100vh-82px)] w-[380px] overflow-y-auto p-4">
          <div className="mb-4">
            <div className="text-lg font-semibold text-black">
              {t("panel.title")}
            </div>
            <div className="mt-1 text-sm text-black/45">
              {t("panel.description")}
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
            initialValues={writeConfig}
          >
            <Form.Item
              label={t("form.topic")}
              name="topic"
              rules={[
                {
                  required: true,
                  message: t("form.topicRequired"),
                },
              ]}
            >
              <Input placeholder={t("placeholder.topic")} allowClear />
            </Form.Item>

            <Form.Item label={t("form.articleType")} name="articleType">
              <Select
                options={[
                  {
                    label: "博客文章",
                    value: "blog",
                  },
                  {
                    label: "摘要总结",
                    value: "summary",
                  },
                  {
                    label: "技术报告",
                    value: "report",
                  },
                  {
                    label: "产品介绍",
                    value: "product",
                  },
                  {
                    label: "故事创作",
                    value: "story",
                  },
                  {
                    label: "邮件",
                    value: "email",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item label={t("form.language")} name="language">
              <Select
                options={[
                  {
                    label: t("options.language.zh-CN"),
                    value: "chinese",
                  },
                  {
                    label: t("options.language.en-US"),
                    value: "english",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item label={t("form.tone")} name="tone">
              <Select
                options={[
                  {
                    label: t("options.tone.professional"),
                    value: "professional",
                  },
                  {
                    label: t("options.tone.friendly"),
                    value: "friendly",
                  },
                  {
                    label: t("options.tone.formal"),
                    value: "formal",
                  },
                  {
                    label: t("options.tone.persuasive"),
                    value: "persuasive",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item label={t("form.length")} name="length">
              <Select
                options={[
                  {
                    label: t("options.length.short"),
                    value: "short",
                  },
                  {
                    label: t("options.length.medium"),
                    value: "medium",
                  },
                  {
                    label: t("options.length.long"),
                    value: "long",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={t("form.creativity")}
              name="creativity"
              tooltip={t("tooltip.creativity")}
            >
              <Slider min={0} max={100} />
            </Form.Item>
          </Form>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={cn(styles.illustrationBox, "prose mr-4 rounded-2xl")}
            style={{
              maxWidth: "stretch",
            }}
          >
            <MarkdownEditor
              markdown={markdownContent}
              toolbarClassName="rounded-tl-2xl! rounded-tr-2xl!"
              contentEditableClassName="h-[calc(100vh-148px)] scrollbar-thin overflow-y-auto "
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIWrite
