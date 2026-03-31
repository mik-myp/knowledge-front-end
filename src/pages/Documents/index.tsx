import UploadBtn from "../../components/UploadBtn"
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
import { formatFileSize, getDocumentIndexStatusMeta } from "@/lib/utils"
import type { TDocumentListRecord } from "@/types/documents"
import {
  Flex,
  Table,
  type TableProps,
  Button,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd"
import {
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import useDocumentsVersion from "@/stores/useDocumentsVersion"
import { useState } from "react"
import dayjs from "dayjs"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation(["document", "common"])
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
      title: t("list.fileName"),
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
      title: t("list.knowledgeBase"),
      dataIndex: "knowledgeBaseName",
    },
    {
      title: t("list.extension"),
      dataIndex: "extension",
    },
    {
      dataIndex: "mimeType",
      title: t("list.fileType"),
    },
    {
      dataIndex: "size",
      title: t("list.fileSize"),
      render: (_, record) => {
        return formatFileSize(record.size)
      },
    },
    {
      dataIndex: "indexStatus",
      title: t("list.indexStatus"),
      render: (_, record) => {
        const statusMeta = getDocumentIndexStatusMeta(record.indexStatus)

        return (
          <div className="flex items-center gap-2">
            <Tag color={statusMeta.color} className="mr-0">
              {statusMeta.label}
            </Tag>
            {record.indexStatus === "failed" && record.indexingError ? (
              <Tooltip title={record.indexingError}>
                <ExclamationCircleOutlined className="text-red-500" />
              </Tooltip>
            ) : null}
          </div>
        )
      },
    },
    {
      dataIndex: "createdAt",
      title: t("list.createdAt"),
      render: (_, record) => {
        return dayjs(record.createdAt).format("YYYY-MM-DD HH:mm:ss")
      },
    },
    {
      dataIndex: "updatedAt",
      title: t("list.updatedAt"),
      render: (_, record) => {
        return dayjs(record.updatedAt).format("YYYY-MM-DD HH:mm:ss")
      },
    },
    {
      title: t("list.actions"),
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
              title={t("list.deleteConfirm")}
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
          <Button type="primary" onClick={refreshAsync}>
            {t("list.refresh")}
          </Button>
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
            {t("list.bulkDelete")}
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
            showTotal: (total) => t("list.total", { count: total }),
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
