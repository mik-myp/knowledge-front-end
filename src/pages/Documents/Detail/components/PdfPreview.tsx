import { LeftOutlined, RightOutlined } from "@ant-design/icons"
import { useRequest, useSize } from "ahooks"
import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import pdfWorker from "react-pdf/dist/pdf.worker.entry.js?url"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Button, Empty, Flex, Spin, Typography } from "antd"
import { fetchDocumentFile } from "@/services/document"
import { useTranslation } from "react-i18next"

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

const { Text } = Typography

/**
 * 描述 PDF 预览组件的属性。
 */
type PdfPreviewProps = {
  documentId: string
}

/**
 * 渲染Pdf预览组件。
 * @param props 组件属性。
 * @param props.documentId 文档 ID。
 * @returns 返回组件渲染结果。
 */
const PdfPreview = ({ documentId }: PdfPreviewProps) => {
  const { t } = useTranslation("document")
  const previewRef = useRef<HTMLDivElement>(null)
  const previewSize = useSize(previewRef)
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadFailed, setLoadFailed] = useState(false)

  const { runAsync: fetchDocumentFileAsync, loading } = useRequest(
    fetchDocumentFile,
    {
      manual: true,
    }
  )

  useEffect(() => {
    let cancelled = false
    let nextPreviewUrl: string | undefined

    void (async () => {
      try {
        const blob = await fetchDocumentFileAsync({ id: documentId })

        if (cancelled) {
          return
        }

        nextPreviewUrl = URL.createObjectURL(blob)
        setPreviewUrl(nextPreviewUrl)
      } catch {
        if (!cancelled) {
          setLoadFailed(true)
        }
      }
    })()

    return () => {
      cancelled = true

      if (nextPreviewUrl) {
        URL.revokeObjectURL(nextPreviewUrl)
      }
    }
  }, [documentId, fetchDocumentFileAsync])

  if (loading && !previewUrl) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (loadFailed) {
    return <Empty description={t("preview.pdfFailed")} />
  }

  if (!previewUrl) {
    return <Empty description={t("preview.pdfEmpty")} />
  }

  const pageWidth = Math.max((previewSize?.width ?? 960) - 48, 320)

  return (
    <div className="flex h-full flex-col gap-4">
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Flex gap={8} align="center">
          <Button
            icon={<LeftOutlined />}
            disabled={currentPage <= 1}
          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
        >
            {t("preview.pdfPrev")}
          </Button>
          <Button
            icon={<RightOutlined />}
            iconPosition="end"
            disabled={pageCount > 0 && currentPage >= pageCount}
            onClick={() =>
              setCurrentPage((page) =>
                pageCount > 0 ? Math.min(page + 1, pageCount) : page + 1
              )
            }
          >
            {t("preview.pdfNext")}
          </Button>
        </Flex>
        <Text type="secondary">
          {t("preview.pdfPage", {
            current: currentPage,
            total: pageCount > 0 ? ` / ${pageCount}` : "",
          })}
        </Text>
      </Flex>

      <div
        ref={previewRef}
        className="scrollbar-thin flex-1 overflow-auto rounded-xl bg-black/3 p-6"
      >
        <Document
          key={previewUrl}
          file={previewUrl}
          loading={t("preview.pdfLoading")}
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

export default PdfPreview
