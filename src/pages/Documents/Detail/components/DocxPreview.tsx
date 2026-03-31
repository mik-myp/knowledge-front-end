import { useRequest } from "ahooks"
import mammoth from "mammoth"
import { useEffect, useState } from "react"
import { Empty, Spin } from "antd"
import { fetchDocumentFile } from "@/services/document"
import { useTranslation } from "react-i18next"

/**
 * 描述 DOCX 预览组件的属性。
 */
type DocxPreviewProps = {
  documentId: string
}

/**
 * 渲染Docx预览组件。
 * @param props 组件属性。
 * @param props.documentId 文档 ID。
 * @returns 返回组件渲染结果。
 */
const DocxPreview = ({ documentId }: DocxPreviewProps) => {
  const { t } = useTranslation("document")
  const [html, setHtml] = useState("")
  const [loadFailed, setLoadFailed] = useState(false)

  const { runAsync: fetchDocumentFileAsync, loading } = useRequest(
    fetchDocumentFile,
    {
      manual: true,
    }
  )

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const blob = await fetchDocumentFileAsync({ id: documentId })
        const arrayBuffer = await blob.arrayBuffer()
        const result = await mammoth.convertToHtml({
          arrayBuffer,
        })

        if (!cancelled) {
          setHtml(result.value)
        }
      } catch {
        if (!cancelled) {
          setLoadFailed(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [documentId, fetchDocumentFileAsync])

  if (loading && !html) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (loadFailed) {
    return <Empty description={t("preview.docxFailed")} />
  }

  if (!html) {
    return <Empty description={t("preview.docxEmpty")} />
  }

  return (
    <div className="scrollbar-thin h-full overflow-y-auto rounded-xl bg-white p-8">
      <article
        className="mx-auto max-w-4xl text-[15px] leading-8 text-black/85 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-6 [&_ol]:list-decimal [&_p]:mb-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-black/10 [&_td]:p-2 [&_th]:border [&_th]:border-black/10 [&_th]:bg-black/3 [&_th]:p-2 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export default DocxPreview
