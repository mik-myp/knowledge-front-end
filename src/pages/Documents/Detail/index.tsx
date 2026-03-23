import { useParams } from "react-router"
import { XMarkdown } from "@ant-design/x-markdown"
import { useRequest } from "ahooks"
import { findDocumentById } from "@/services/document"
import { useEffect, useMemo } from "react"
import { Spin } from "antd"
const DocumentDetail = () => {
  const { id } = useParams()

  const { data, loading, run } = useRequest(findDocumentById, {
    manual: true,
  })

  const renderMain = useMemo(() => {
    if (!data) return null

    if (data.extension === "md") {
      return (
        <XMarkdown
          className="x-markdown-light scrollbar-none h-[calc(100vh-160px)] overflow-y-auto"
          content={data.content}
        />
      )
    }
    return null
  }, [data])

  useEffect(() => {
    if (id) run({ id })
  }, [id, run])

  return (
    <Spin spinning={loading} className="h-full">
      {renderMain}
    </Spin>
  )
}
export default DocumentDetail
