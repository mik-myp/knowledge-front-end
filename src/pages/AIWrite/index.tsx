import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Button, Form, Input, Select, Slider, Space, theme } from "antd"
import "@mdxeditor/editor/style.css"
import MarkdownEditor from "@/components/MarkdownEditor"
import { useStyles } from "@/lib/illustrationTheme"
import { cn } from "@/lib/utils"
import { useAIWrite } from "@/stores/useAIWrite"
import { modal, message } from "@/lib/antdNotification"
import { startWriteStream } from "@/services/write"
import type { TAIWriteConfig } from "@/types/write"
import KnowledgeSelectModal from "@/components/KnowledgeSelectModal"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"
import { useRequest } from "ahooks"
import { editorDocument } from "@/services/document"

const codeFencePattern = /^ {0,3}(`{3,}|~{3,}).*$/

const buildStreamingPreviewMarkdown = (value: string) => {
  if (!value) {
    return value
  }

  const lines = value.split("\n")
  let openFence: string | null = null

  for (const line of lines) {
    const matchedFence = line.match(codeFencePattern)?.[1]

    if (!matchedFence) {
      continue
    }

    if (!openFence) {
      openFence = matchedFence
      continue
    }

    if (
      matchedFence[0] === openFence[0] &&
      matchedFence.length >= openFence.length
    ) {
      openFence = null
    }
  }

  if (!openFence) {
    return value
  }

  const nextLineBreak = value.endsWith("\n") ? "" : "\n"

  return `${value}${nextLineBreak}${openFence}`
}

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
  const [isStreaming, setIsStreaming] = useState(false)
  const [progressText, setProgressText] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [documentName, setDocumentName] = useState("")
  const abortControllerRef = useRef<AbortController | null>(null)

  const { runAsync: editorAsync, loading: editorLoading } = useRequest(
    editorDocument,
    {
      manual: true,
    }
  )

  const handleValuesChange = (_: unknown, allValues: TAIWriteConfig) => {
    setWriteConfig(allValues)
  }

  const handleReset = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    resetWriteConfig()
    form.resetFields()
    setMarkdownContent("")
    setProgressText("")
    setIsStreaming(false)
  }

  const confirmOverwrite = () =>
    new Promise<boolean>((resolve) => {
      modal.confirm({
        title: t("overwriteConfirm.title"),
        content: t("overwriteConfirm.description"),
        okText: t("overwriteConfirm.confirm"),
        cancelText: t("overwriteConfirm.cancel"),
        onOk: async () => {
          resolve(true)
        },
        onCancel: async () => {
          resolve(false)
        },
      })
    })

  const handleStartWrite = async () => {
    let validatedValues: TAIWriteConfig

    try {
      validatedValues = await form.validateFields()
    } catch {
      return
    }

    if (markdownContent.trim()) {
      const confirmed = await confirmOverwrite()

      if (!confirmed) {
        return
      }
    }

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsStreaming(true)
    setMarkdownContent("")
    setProgressText(t("streaming.pending"))

    try {
      await startWriteStream(validatedValues, {
        signal: controller.signal,
        onChunk: (chunk) => {
          if (typeof chunk.content === "string") {
            setMarkdownContent(
              chunk.done
                ? chunk.content
                : buildStreamingPreviewMarkdown(chunk.content)
            )
          }

          if (chunk.progress?.trim()) {
            setProgressText(chunk.progress)
          }
        },
      })
    } catch (error) {
      if (controller.signal.aborted) {
        return
      }

      const errorMessage =
        error instanceof Error ? error.message : t("streaming.failed")

      message.error(t("streaming.errorTitle") + ": " + errorMessage)
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
        setIsStreaming(false)
        setProgressText("")
      }
    }
  }

  const handleConfirm = async (knowledge?: TKnowledgeBaseRecord) => {
    if (!knowledge) {
      message.error(t("submitDialog.selectKnowledge"))
      return
    }
    if (!documentName) {
      message.error(t("submitDialog.documentNameRequired"))
      return
    }

    await editorAsync({
      knowledgeBaseId: knowledge.id,
      name: documentName,
      content: markdownContent,
    })

    message.success(t("submitDialog.success"))

    setModalOpen(false)

    handleReset()
  }

  const handleSubmit = () => {
    setModalOpen(true)
  }

  const handleCancel = () => {
    setModalOpen(false)
  }

  const handleChangeDocumentName = (e: ChangeEvent<HTMLInputElement>) => {
    setDocumentName(e.target.value)
  }

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return (
    <div className="bg-white">
      <div style={{ background: colorBgContainer }}>
        <div className="flex h-20 items-center justify-between border-b border-black/6 px-4">
          <Button type="link" onClick={() => navigate(-1)}>
            {t("header.back")}
          </Button>
          <Space size="middle">
            <Button onClick={handleReset} disabled={isStreaming}>
              {t("actions.reset")}
            </Button>
            <Button
              type="primary"
              onClick={handleStartWrite}
              loading={isStreaming}
            >
              {t("actions.start")}
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={isStreaming || !markdownContent.trim()}
              loading={editorLoading}
            >
              {t("actions.submit")}
            </Button>
          </Space>
        </div>
      </div>

      <div className="flex w-full gap-4">
        <div className="h-[calc(100vh-82px)] w-95 overflow-y-auto p-4">
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
            disabled={isStreaming}
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
                    label: t("options.articleType.blog"),
                    value: "blog",
                  },
                  {
                    label: t("options.articleType.summary"),
                    value: "summary",
                  },
                  {
                    label: t("options.articleType.report"),
                    value: "report",
                  },
                  {
                    label: t("options.articleType.product"),
                    value: "product",
                  },
                  {
                    label: t("options.articleType.story"),
                    value: "story",
                  },
                  {
                    label: t("options.articleType.email"),
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
              <Slider min={0} max={1} step={0.1} />
            </Form.Item>
          </Form>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              styles.illustrationBox,
              "mt-4 mr-4 flex h-[calc(100vh-112px)] flex-col overflow-hidden rounded-2xl"
            )}
          >
            <div
              className="prose min-h-0 flex-1 overflow-hidden"
              style={{ maxWidth: "stretch" }}
            >
              <div className="h-full">
                <MarkdownEditor
                  markdown={markdownContent}
                  onChange={(value) => setMarkdownContent(value)}
                  readOnly={isStreaming}
                  placeholder={
                    isStreaming
                      ? progressText || t("streaming.pending")
                      : t("editor.emptyDescription")
                  }
                  toolbarClassName="rounded-none border-x-0 border-t-0"
                  contentEditableClassName="h-[calc(100vh-170px)] overflow-y-auto px-6 pb-6 scrollbar-thin"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <KnowledgeSelectModal
        open={modalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title={t("submitDialog.title")}
        header={
          <Input
            placeholder={t("submitDialog.placeholder")}
            className="my-6"
            value={documentName}
            onChange={handleChangeDocumentName}
          />
        }
        confirmLoading={editorLoading}
      />
    </div>
  )
}

export default AIWrite
