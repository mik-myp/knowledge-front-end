import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons"
import { XMarkdown } from "@ant-design/x-markdown"
import { useRequest, useSize } from "ahooks"
import mammoth from "mammoth"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router"
import { Document, Page, pdfjs } from "react-pdf"
import pdfWorker from "react-pdf/dist/pdf.worker.entry.js?url"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Button, Empty, Flex, Spin, Tag, Typography } from "antd"
import {
  downloadDocumentOriginalFile,
  fetchDocumentFile,
  findDocumentById,
} from "@/services/document"

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

const { Paragraph, Text, Title } = Typography

const supportedPreviewExtensions = new Set([
  "md",
  "markdown",
  "txt",
  "pdf",
  "docx",
])

const DocumentDetail = () => {
  const { id } = useParams()
  const previewRef = useRef<HTMLDivElement>(null)
  const previewSize = useSize(previewRef)

  const [previewUrl, setPreviewUrl] = useState<{
    documentId: string
    value: string
  }>()
  const [docxHtml, setDocxHtml] = useState<{
    documentId: string
    value: string
  }>()
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, run } = useRequest(findDocumentById, {
    manual: true,
  })

  const { runAsync: fetchDocumentFileAsync, loading: previewLoading } =
    useRequest(fetchDocumentFile, {
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

  useEffect(() => {
    let revokedUrl: string | undefined
    let cancelled = false

    if (!data || !["pdf", "docx"].includes(data.extension)) {
      return () => {
        /* empty */
      }
    }

    void (async () => {
      try {
        const blob = await fetchDocumentFileAsync({ id: data.id })

        if (cancelled) {
          return
        }

        if (data.extension === "pdf") {
          revokedUrl = URL.createObjectURL(blob)
          setPreviewUrl({
            documentId: data.id,
            value: revokedUrl,
          })
          return
        }

        const arrayBuffer = await blob.arrayBuffer()
        const result = await mammoth.convertToHtml({
          arrayBuffer,
        })

        if (!cancelled) {
          setDocxHtml({
            documentId: data.id,
            value: result.value,
          })
        }
      } catch {
        if (!cancelled) {
          setPreviewUrl((currentValue) =>
            currentValue?.documentId === data.id ? undefined : currentValue
          )
          setDocxHtml((currentValue) =>
            currentValue?.documentId === data.id ? undefined : currentValue
          )
        }
      }
    })()

    return () => {
      cancelled = true

      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl)
      }
    }
  }, [data, fetchDocumentFileAsync])

  if (!data) {
    return <Spin spinning className="h-full w-full justify-center" />
  }

  const activePreviewUrl =
    previewUrl?.documentId === data.id ? previewUrl.value : undefined
  const activeDocxHtml = docxHtml?.documentId === data.id ? docxHtml.value : ""
  const pageWidth = Math.max((previewSize?.width ?? 960) - 48, 320)

  const renderPreview = () => {
    if (!supportedPreviewExtensions.has(data.extension)) {
      return (
        <Empty
          description={`暂不支持预览 ${data.extension.toUpperCase()} 文件`}
        />
      )
    }

    if (data.extension === "md" || data.extension === "markdown") {
      return (
        <XMarkdown
          className="x-markdown-light scrollbar-none h-full overflow-y-auto"
          content={data.content ?? ""}
        />
      )
    }

    if (data.extension === "txt") {
      return (
        <pre className="scrollbar-thin h-full overflow-y-auto rounded-xl bg-black/3 p-6 text-sm leading-7 whitespace-pre-wrap text-black/80">
          {data.content ?? ""}
        </pre>
      )
    }

    if (data.extension === "pdf") {
      if (!activePreviewUrl) {
        return <Empty description="PDF 正在加载中" />
      }

      return (
        <div className="flex h-full flex-col gap-4">
          <Flex justify="space-between" align="center" wrap gap={12}>
            <Flex gap={8} align="center">
              <Button
                icon={<LeftOutlined />}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              >
                上一页
              </Button>
              <Button
                icon={<RightOutlined />}
                iconPlacement="end"
                disabled={pageCount > 0 && currentPage >= pageCount}
                onClick={() =>
                  setCurrentPage((page) =>
                    pageCount > 0 ? Math.min(page + 1, pageCount) : page + 1
                  )
                }
              >
                下一页
              </Button>
            </Flex>
            <Text type="secondary">
              第 {currentPage} 页{pageCount > 0 ? ` / 共 ${pageCount} 页` : ""}
            </Text>
          </Flex>

          <div className="scrollbar-thin flex-1 overflow-auto rounded-xl bg-black/3 p-6">
            <Document
              file={activePreviewUrl}
              loading="PDF 加载中..."
              onLoadSuccess={({ numPages }) => {
                setPageCount(numPages)
                setCurrentPage(1)
              }}
            >
              <Page pageNumber={currentPage} width={pageWidth} />
            </Document>
          </div>
        </div>
      )
    }

    if (!activeDocxHtml) {
      return <Empty description="DOCX 正在解析中" />
    }

    return (
      <div className="scrollbar-thin h-full overflow-y-auto rounded-xl bg-white p-8">
        <article
          className="mx-auto max-w-4xl text-[15px] leading-8 text-black/85 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-6 [&_ol]:list-decimal [&_p]:mb-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-black/10 [&_td]:p-2 [&_th]:border [&_th]:border-black/10 [&_th]:bg-black/3 [&_th]:p-2 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: activeDocxHtml }}
        />
      </div>
    )
  }

  return (
    <Spin spinning={loading || previewLoading} className="h-full w-full">
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
              <Tag>{data.extension.toUpperCase()}</Tag>
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

        <div ref={previewRef} className="min-h-0 flex-1 overflow-hidden">
          {renderPreview()}
        </div>
      </div>
    </Spin>
  )
}

export default DocumentDetail
