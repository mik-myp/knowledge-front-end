import UploadBtn from "./components/UploadBtn"
import {
  useAntdTable,
  useEventListener,
  useRequest,
  useUpdateEffect,
} from "ahooks"
import {
  deleteAllDocumentById,
  deleteDocumentById,
  downloadDocumentOriginalFile,
  findAllDocuments,
} from "@/services/document"
import type { TDocumentListRecord } from "@/types/documents"
import { Flex, Table, type TableProps, Button, Popconfirm } from "antd"
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons"
import useDocumentsVersion from "@/stores/useDocumentsVersion"
import { useState } from "react"
import dayjs from "dayjs"
import { useNavigate } from "react-router"

/**
 * 表格可视区域需要扣除的固定高度。
 */
const diffHeight = 342

/**
 * 获取TableScrollY。
 * @returns 返回数值结果。
 */
const getTableScrollY = (): number => window.innerHeight - diffHeight

/**
 * 渲染文档组件。
 * @returns 返回组件渲染结果。
 */
const Documents = () => {
  const navigate = useNavigate()
  const { version, invalidate } = useDocumentsVersion()

  const [scrollY, setScrollY] = useState<number>(getTableScrollY)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const { tableProps, refreshAsync, loading } = useAntdTable(
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

  const {
    runAsync: deleteAllDocumentByIdAsync,
    loading: deleteAllDocumentByIdLoading,
  } = useRequest(deleteAllDocumentById, {
    manual: true,
    onSuccess: async () => {
      invalidate()
    },
  })

  const { runAsync: downloadDocumentAsync, loading: downloadLoading } =
    useRequest(downloadDocumentOriginalFile, {
      manual: true,
    })

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

  const columns: TableProps<TDocumentListRecord>["columns"] = [
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
      width: 150,
      render: (_, record) => {
        return (
          <Flex>
            <Button
              icon={<DownloadOutlined />}
              className="mr-2"
              onClick={(event) => {
                event.stopPropagation()
                void downloadDocumentAsync({
                  id: record.id,
                  fileName: record.originalName,
                  extension: record.extension,
                })
              }}
              loading={downloadLoading}
            />
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
    <div className="w-full flex-col">
      <div className="flex items-center justify-end">
        <div className="flex flex-row gap-4">
          <UploadBtn />
          <Button
            disabled={selectedRowKeys.length === 0}
            onClick={async () => {
              await deleteAllDocumentByIdAsync({
                documentIds: selectedRowKeys as string[],
              })
            }}
            loading={deleteAllDocumentByIdLoading}
          >
            批量删除
          </Button>
        </div>
      </div>
      <div className="h-[calc(100vh-180px)] min-h-0 flex-1 pt-4">
        <Table<TDocumentListRecord>
          {...tableProps}
          rowKey="id"
          loading={
            loading ||
            deleteLoading ||
            deleteAllDocumentByIdLoading ||
            downloadLoading
          }
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
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys)
            },
          }}
        />
      </div>
    </div>
  )
}

export default Documents
