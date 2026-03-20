import { DataTable } from "@/components/ui/data-table"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"

import { type ColumnDef } from "@tanstack/react-table"
import UploadBtn from "./components/UploadBtn"

const columns: ColumnDef<TKnowledgeBaseRecord>[] = [
  {
    accessorKey: "name",
    header: "名称",
  },
  {
    accessorKey: "description",
    header: "描述",
  },
  {
    accessorKey: "documentCount",
    header: "文档数量缓存",
  },
  {
    accessorKey: "chunkCount",
    header: "切片数量缓存",
  },
]

const Knowledge = () => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-lg">知识库</div>
          <div className="text-xs text-muted-foreground">0 个文档</div>
        </div>

        <UploadBtn />
      </div>
      <div className="container mx-auto py-4">
        <DataTable columns={columns} data={[]} />
      </div>
    </div>
  )
}

export default Knowledge
