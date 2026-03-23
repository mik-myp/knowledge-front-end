import UploadBtn from "./components/UploadBtn"
import {
  useAntdTable,
  useEventListener,
  useRequest,
  useUpdateEffect,
} from "ahooks"
import { deleteDocumentById, findAllDocuments } from "@/services/document"
import type { TDocumentRecord } from "@/types/documents"
import { Flex, Table, type TableProps, Button, Popconfirm } from "antd"
import { DeleteOutlined } from "@ant-design/icons"
import useDocumentsVersion from "@/stores/useDocumentsVersion"
import { useState } from "react"
import dayjs from "dayjs"
import { useNavigate } from "react-router"

const diffHeight = 342
const getTableScrollY = (): number => window.innerHeight - diffHeight

const Documents = () => {
  const navigate = useNavigate()
  const { version, invalidate } = useDocumentsVersion()

  const [scrollY, setScrollY] = useState<number>(getTableScrollY)

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
      onSuccess: async () => {
        invalidate()
      },
    }
  )

  useUpdateEffect(() => {
    void refreshAsync()
  }, [version])

  useEventListener(
    "resize",
    () => {
      setScrollY(getTableScrollY())
    },
    {
      target: () => window,
    }
  )

  const columns: TableProps<TDocumentRecord>["columns"] = [
    {
      title: "文件名",
      dataIndex: "originalName",
      render: (_, record) => {
        return (
          <div
            onClick={() => navigate(`/documents/${record.id}`)}
            className="cursor-pointer"
          >
            {record.originalName}
          </div>
        )
      },
    },
    {
      title: "所属知识库",
      dataIndex: "knowledgeBaseName",
    },
    {
      title: "文件扩展名",
      dataIndex: "extension",
    },
    {
      dataIndex: "mimeType",
      title: "文件类型",
    },
    {
      dataIndex: "size",
      title: "文件大小（KB）",
    },
    {
      dataIndex: "createdAt",
      title: "创建时间",
      render: (_, record) => {
        return dayjs(record.createdAt).format("YYYY-MM-DD HH:mm:ss")
      },
    },
    {
      dataIndex: "updatedAt",
      title: "更新时间",
      render: (_, record) => {
        return dayjs(record.updatedAt).format("YYYY-MM-DD HH:mm:ss")
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      width: 100,
      render: (_, record) => {
        return (
          <Flex>
            <Popconfirm
              title="确定要删除吗？"
              onConfirm={() => deleteAsync({ id: record.id })}
              arrow={false}
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

        <UploadBtn />
      </div>
      <div className="mx-auto h-[calc(100vh-180px)] py-4">
        <Table<TDocumentRecord>
          {...tableProps}
          rowKey="id"
          loading={loading || deleteLoading}
          columns={columns}
          scroll={{
            y: scrollY,
          }}
          pagination={{
            ...tableProps.pagination,
            pageSizeOptions: ["10", "20", "50"],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条数据`,
          }}
        />
      </div>
    </div>
  )
}

export default Documents
