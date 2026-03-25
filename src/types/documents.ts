/**
 * 定义文档来源类型的类型结构。
 */
export type TDocumentSourceType = "upload" | "editor"

/**
 * 定义文档的数据记录结构。
 */
export type TDocumentRecord = {
  id: string
  userId: string
  knowledgeBaseId: string
  originalName: string
  extension: string
  mimeType: string
  size: number
  sourceType: TDocumentSourceType
  content?: string
  createdAt: string
  updatedAt: string
}

/**
 * 定义文档列表的数据记录结构。
 */
export type TDocumentListRecord = TDocumentRecord & {
  knowledgeBaseName: string
}

/**
 * 定义文档列表的结果结构。
 */
export type TDocumentListResult = {
  dataList: TDocumentListRecord[]
  total: number
}

/**
 * 定义删除文档的结果结构。
 */
export type TRemoveDocumentsResult = {
  deletedCount: number
  deletedIds: string[]
}
