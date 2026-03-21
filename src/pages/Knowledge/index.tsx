import { DataTable } from "@/components/ui/data-table"

import { type ColumnDef } from "@tanstack/react-table"
import UploadBtn from "./components/UploadBtn"
import { useRequest } from "ahooks"
import { findAllDocuments } from "@/services/document"
import type { TDocumentRecord } from "@/types/documents"
import { useState } from "react"

const columns: ColumnDef<TDocumentRecord, TDocumentRecord>[] = [
  {
    accessorKey: "originalName",
    header: "原始文件名",
  },
  {
    accessorKey: "extension",
    header: "原始扩展名",
  },
  {
    accessorKey: "fileType",
    header: "展示级文件类型",
  },
  {
    accessorKey: "mimeType",
    header: "MIME 类型",
  },
  {
    accessorKey: "size",
    header: "文件大小",
  },
  {
    accessorKey: "status",
    header: "文档处理状态",
  },
]

const Knowledge = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  })

  const { data, loading } = useRequest(findAllDocuments, {
    defaultParams: [
      {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    ],
    refreshDeps: [pagination.pageIndex, pagination.pageSize],
  })

  const { dataList, total } = data || {}

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-lg">知识库</div>
          <div className="text-xs text-muted-foreground">
            {total || 0} 个文档
          </div>
        </div>

        <UploadBtn />
      </div>
      <div className="mx-auto py-4">
        <DataTable
          columns={columns}
          data={dataList || []}
          loading={loading}
          state={{ pagination }}
          onPaginationChange={setPagination}
        />
      </div>
    </div>
  )
}

export default Knowledge
