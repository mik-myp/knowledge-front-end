import UploadBtn from "./components/UploadBtn"
import { useAntdTable, useRequest } from "ahooks"
import { deleteDocumentById, findAllDocuments } from "@/services/document"
import type { TDocumentRecord } from "@/types/documents"
import { Flex, Table, type TableProps, Button, Popconfirm } from "antd"
import { DeleteOutlined } from "@ant-design/icons"

const Documents = () => {
  const { tableProps, refreshAsync, data, loading } = useAntdTable(
    async ({ current, pageSize }) => {
      const res = await findAllDocuments({ page: current, pageSize })
      return {
        list: res.dataList,
        total: res.total,
      }
    },
    {
      defaultCurrent: 1,
      defaultPageSize: 10,
    }
  )

  const { runAsync: deleteAsync, loading: deleteLoading } = useRequest(
    deleteDocumentById,
    {
      manual: true,
      onSuccess: async () => await refreshAsync(),
    }
  )

  const columns: TableProps<TDocumentRecord>["columns"] = [
    {
      title: "原始文件名",
      dataIndex: "originalName",
    },
    {
      dataIndex: "extension",
      title: "原始扩展名",
    },
    {
      dataIndex: "fileType",
      title: "展示级文件类型",
    },
    {
      dataIndex: "mimeType",
      title: "MIME 类型",
    },
    {
      dataIndex: "size",
      title: "文件大小",
    },
    {
      dataIndex: "status",
      title: "文档处理状态",
    },
    {
      title: "操作",
      dataIndex: "action",
      width: 100,
      render: (_, record) => {
        return (
          <Flex>
            <Popconfirm
              arrow
              title="确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => deleteAsync({ id: record.id })}
            >
              <Button icon={<DeleteOutlined />} danger type="primary" />
            </Popconfirm>
          </Flex>
        )
      },
    },
  ]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-lg">知识库</div>
          <div className="text-muted-foreground text-xs">
            {data?.total || 0} 个文档
          </div>
        </div>

        <UploadBtn refreshAsync={refreshAsync} />
      </div>
      <div className="mx-auto py-4">
        <Table<TDocumentRecord>
          {...tableProps}
          loading={loading || deleteLoading}
          columns={columns}
          scroll={{
            y: 550,
          }}
        />
      </div>
    </div>
  )
}

export default Documents
