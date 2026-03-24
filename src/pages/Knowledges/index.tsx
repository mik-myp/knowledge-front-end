import {
  deleteDocumentById,
  downloadDocumentOriginalFile,
  findAllDocuments,
} from "@/services/document"
import { useStyles } from "@/lib/illustrationTheme"
import { getKnowledgeById } from "@/services/knowledge"
import useDocumentsVersion from "@/stores/useDocumentsVersion"
import type { TDocumentListRecord } from "@/types/documents"
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons"
import { useInfiniteScroll, useRequest } from "ahooks"
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Masonry,
  Popconfirm,
  Spin,
  theme,
  Typography,
  type DescriptionsProps,
  type MasonryProps,
} from "antd"
import { useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router"
import UploadBtn from "../Documents/components/UploadBtn"

const { Text } = Typography
const documentsPageSize = 12

const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} KB`
  }

  return `${(size / 1024).toFixed(2)} MB`
}

const getExtensionPalette = (
  extension: string
): {
  background: string
  text: string
  accent: string
} => {
  const normalizedExtension = extension.toLowerCase()

  if (normalizedExtension === "pdf") {
    return {
      background: "#FFE3E3",
      text: "#C92A2A",
      accent: "#FA5252",
    }
  }

  if (normalizedExtension === "docx") {
    return {
      background: "#DCEBFF",
      text: "#1C4FD7",
      accent: "#4DABF7",
    }
  }

  if (normalizedExtension === "md" || normalizedExtension === "markdown") {
    return {
      background: "#FFF3BF",
      text: "#A15C00",
      accent: "#FCC419",
    }
  }

  return {
    background: "#E6FCF5",
    text: "#087F5B",
    accent: "#20C997",
  }
}

type TKnowledgeDocumentsInfiniteData = {
  list: TDocumentListRecord[]
  page: number
  pageSize: number
  total: number
}

const Knowledges = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const { styles } = useStyles()
  const {
    token: { colorTextSecondary, colorBorder, colorBgContainer },
  } = theme.useToken()

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
    loadingMore,
    noMore,
    reloadAsync,
  } = useInfiniteScroll<TKnowledgeDocumentsInfiniteData>(
    async (currentData) => {
      if (!id) {
        return {
          list: [],
          page: 1,
          pageSize: documentsPageSize,
          total: 0,
        }
      }

      const nextPage = currentData ? currentData.page + 1 : 1
      const res = await findAllDocuments({
        knowledgeBaseId: id,
        page: nextPage,
        pageSize: documentsPageSize,
      })

      return {
        list: res.dataList,
        page: nextPage,
        pageSize: documentsPageSize,
        total: res.total,
      }
    },
    {
      target: () => scrollContainerRef.current,
      reloadDeps: [id, version],
      isNoMore: (result) => {
        if (!result) {
          return false
        }

        return result.list.length >= result.total
      },
    }
  )

  const documents = documentsData?.list ?? []

  const hasDocuments = documents.length > 0
  const isInitialDocumentsLoading = documentsLoading && !hasDocuments

  const { runAsync: deleteAsync, loading: deleteLoading } = useRequest(
    deleteDocumentById,
    {
      manual: true,
      onSuccess: async () => await reloadAsync(),
    }
  )

  const { runAsync: downloadDocumentAsync, loading: downloadLoading } =
    useRequest(downloadDocumentOriginalFile, {
      manual: true,
    })

  const descriptionsItems: DescriptionsProps["items"] = [
    {
      key: "description",
      label: "描述",
      children: data?.description,
    },
  ]

  const masonryItems: MasonryProps["items"] = documents.map((item) => ({
    key: item.id,
    data: item,
    children: (
      <Card
        title={
          <div className="flex min-w-0 flex-col gap-1">
            <Text strong ellipsis className="text-sm">
              {item.originalName}
            </Text>
            <Text
              className="text-xs tracking-[0.18em]! uppercase"
              type="secondary"
            >
              document card
            </Text>
          </div>
        }
        loading={isInitialDocumentsLoading}
        className={`${styles.illustrationBox} cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-1`}
        extra={
          <div className="flex items-center gap-2">
            <Button
              icon={<DownloadOutlined />}
              onClick={(event) => {
                event.stopPropagation()
                void downloadDocumentAsync({
                  id: item.id,
                  fileName: item.originalName,
                  extension: item.extension,
                })
              }}
              loading={downloadLoading}
            />
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
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </div>
        }
        onClick={() => navigate(`/documents/${item.id}`)}
      >
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl p-4"
            style={{
              background: `linear-gradient(135deg, ${getExtensionPalette(item.extension).background} 0%, ${colorBgContainer} 100%)`,
              border: `1px dashed ${colorBorder}`,
            }}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase"
                    style={{
                      backgroundColor: getExtensionPalette(item.extension)
                        .accent,
                      color: "#ffffff",
                    }}
                  >
                    {item.extension}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: "#FFFFFFCC",
                      color: getExtensionPalette(item.extension).text,
                    }}
                  >
                    {item.mimeType}
                  </span>
                </div>
                <Text ellipsis className="text-sm font-medium!">
                  {item.knowledgeBaseName}
                </Text>
              </div>
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-bold uppercase"
                style={{
                  backgroundColor: "#FFFFFFCC",
                  color: getExtensionPalette(item.extension).text,
                  border: `1px solid ${colorBorder}`,
                }}
              >
                {item.extension.slice(0, 2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/80 px-3 py-2">
                <div
                  className="mb-1 text-[11px] tracking-[0.16em] uppercase"
                  style={{ color: colorTextSecondary }}
                >
                  文件大小
                </div>
                <Text strong>{formatFileSize(item.size)}</Text>
              </div>
              <div className="rounded-xl bg-white/80 px-3 py-2">
                <div
                  className="mb-1 text-[11px] tracking-[0.16em] uppercase"
                  style={{ color: colorTextSecondary }}
                >
                  文件来源
                </div>
                <Text strong>
                  {item.sourceType === "upload" ? "上传" : "编辑器"}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Card>
    ),
  }))

  useEffect(() => {
    if (!id) return
    void getKnowledgeByIdAsync({ id })
  }, [id, getKnowledgeByIdAsync])

  return (
    <Spin
      spinning={loading || deleteLoading || downloadLoading || documentsLoading}
    >
      <div className="flex h-[calc(100vh-176px)] flex-col overflow-hidden">
        <Descriptions
          title={data?.name}
          items={descriptionsItems}
          extra={<UploadBtn knowledgeId={id} />}
        />
        <Divider />
        <div
          ref={scrollContainerRef}
          className="scrollbar-none min-h-0 flex-1 overflow-y-auto pt-1 pr-1"
        >
          {hasDocuments ? (
            <>
              <Masonry columns={4} gutter={16} items={masonryItems} />
              <div className="py-4 text-center text-sm text-gray-500">
                {loadingMore ? (
                  <div>加载中...</div>
                ) : noMore ? (
                  "已加载全部文档"
                ) : null}
              </div>
            </>
          ) : (
            !isInitialDocumentsLoading && <Empty description="暂无文档" />
          )}
        </div>
      </div>
    </Spin>
  )
}

export default Knowledges
