import { deleteDocumentById, findAllDocuments } from "@/services/document"
import { getKnowledgeById } from "@/services/knowledge"
import useDocumentsVersion from "@/stores/useDocumentsVersion"
import { DeleteOutlined } from "@ant-design/icons"
import { useRequest } from "ahooks"
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Masonry,
  Popconfirm,
  Spin,
  Typography,
  type DescriptionsProps,
  type MasonryProps,
} from "antd"
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router"

const { Text } = Typography

const Knowledges = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { version } = useDocumentsVersion()

  const {
    data,
    loading,
    runAsync: getKnowledgeByIdAsync,
  } = useRequest(getKnowledgeById, {
    manual: true,
  })

  const {
    data: documentsData,
    loading: documentsLoading,
    runAsync: findAllDocumentsAsync,
    refreshAsync,
  } = useRequest(findAllDocuments, {
    manual: true,
  })

  const { runAsync: deleteAsync, loading: deleteLoading } = useRequest(
    deleteDocumentById,
    {
      manual: true,
      onSuccess: async () => await refreshAsync(),
    }
  )

  const descriptionsItems: DescriptionsProps["items"] = [
    {
      key: "description",
      label: "描述",
      children: data?.description,
    },
  ]

  const masonryItems: MasonryProps["items"] = documentsData?.dataList?.map(
    (item) => ({
      key: item.id,
      data: item,
      children: (
        <Card
          title={item.originalName}
          loading={documentsLoading}
          extra={
            <Popconfirm
              title="确定要删除吗？"
              onConfirm={async (e) => {
                e?.stopPropagation()
                await deleteAsync({ id: item.id })
              }}
              arrow={false}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                type="primary"
                className="ml-2"
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          }
          onClick={() => navigate(`/documents/${item.id}`)}
        >
          <div className="flex flex-col">
            <Text ellipsis>原始扩展名：{item.originalName}</Text>
            <Text ellipsis>展示级文件类型：{item.extension}</Text>
            <Text ellipsis>MIME 类型：{item.mimeType}</Text>
            <Text ellipsis>文件大小：{item.size}</Text>
          </div>
        </Card>
      ),
    })
  )

  useEffect(() => {
    if (!id) return
    getKnowledgeByIdAsync({ id })
    findAllDocumentsAsync({ knowledgeBaseId: id, page: 1, pageSize: 10 })
  }, [id, version, getKnowledgeByIdAsync, findAllDocumentsAsync])

  return (
    <Spin spinning={loading || documentsLoading || deleteLoading}>
      <Descriptions title={data?.name} items={descriptionsItems} />
      <Divider />
      <Masonry
        columns={4}
        gutter={16}
        items={masonryItems}
        className="scrollbar-none h-[calc(100vh-280px)]! overflow-y-scroll"
      />
    </Spin>
  )
}

export default Knowledges
