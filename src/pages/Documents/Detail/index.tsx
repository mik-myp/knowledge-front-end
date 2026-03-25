import { DownloadOutlined } from "@ant-design/icons"
import { useRequest } from "ahooks"
import { lazy, Suspense, useEffect } from "react"
import { useParams } from "react-router"
import { Button, Empty, Flex, Spin, Tag, Typography } from "antd"
import {
  downloadDocumentOriginalFile,
  findDocumentById,
} from "@/services/document"

const { Paragraph, Title } = Typography

const MarkdownPreview = lazy(() => import("./components/MarkdownPreview"))
const PdfPreview = lazy(() => import("./components/PdfPreview"))
const DocxPreview = lazy(() => import("./components/DocxPreview"))

const supportedPreviewExtensions = new Set(["md", "markdown", "txt", "pdf", "docx"])

const previewFallback = (
  <div className="flex h-full items-center justify-center">
    <Spin size="large" />
  </div>
)

const DocumentDetail = () => {
  const { id } = useParams()

  const { data, loading, run } = useRequest(findDocumentById, {
    manual: true,
  })

  const { runAsync: downloadDocumentAsync, loading: downloadLoading } =
    useRequest(downloadDocumentOriginalFile, {
      manual: true,
    })

  useEffect(() => {
    if (id) {
      void run({ id })
    }
  }, [id, run])

  if (loading && !data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!data) {
    return <Empty description="文档不存在或加载失败" />
  }

  const extension = data.extension.toLowerCase()

  const renderPreview = () => {
    if (!supportedPreviewExtensions.has(extension)) {
      return <Empty description={`暂不支持预览 ${extension.toUpperCase()} 文件`} />
    }

    if (extension === "md" || extension === "markdown") {
      return (
        <Suspense fallback={previewFallback}>
          <MarkdownPreview key={data.id} content={data.content} />
        </Suspense>
      )
    }

    if (extension === "txt") {
      return (
        <pre className="scrollbar-thin h-full overflow-y-auto rounded-xl bg-black/3 p-6 text-sm leading-7 whitespace-pre-wrap text-black/80">
          {data.content ?? ""}
        </pre>
      )
    }

    if (extension === "pdf") {
      return (
        <Suspense fallback={previewFallback}>
          <PdfPreview key={data.id} documentId={data.id} />
        </Suspense>
      )
    }

    return (
      <Suspense fallback={previewFallback}>
        <DocxPreview key={data.id} documentId={data.id} />
      </Suspense>
    )
  }

  return (
    <Spin spinning={loading} className="h-full w-full">
      <div className="flex h-[calc(100vh-176px)] flex-col overflow-hidden">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Title level={3} className="mb-2!">
              {data.originalName}
            </Title>
            <Paragraph type="secondary" className="mb-3!">
              文档详情预览页，支持直接查看内容并下载原文件。
            </Paragraph>
            <Flex gap={8} wrap>
              <Tag>{extension.toUpperCase()}</Tag>
              <Tag>{data.mimeType}</Tag>
              <Tag>{data.sourceType}</Tag>
              <Tag>{data.size} KB</Tag>
            </Flex>
          </div>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloadLoading}
            onClick={() =>
              void downloadDocumentAsync({
                id: data.id,
                fileName: data.originalName,
                extension: data.extension,
              })
            }
          >
            下载原文件
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">{renderPreview()}</div>
      </div>
    </Spin>
  )
}

export default DocumentDetail
