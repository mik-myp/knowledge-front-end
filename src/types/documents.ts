/**
 * 定义文档来源类型的类型结构。
 */
export type TDocumentSourceType = "upload" | "editor"

/**
 * 定义文档索引状态的类型结构。
 */
export type TDocumentIndexStatus = "pending" | "indexing" | "success" | "failed"

/**
 * 定义文档列表查询参数结构。
 */
export type TListDocumentsQuery = {
  page?: number
  pageSize?: number
  knowledgeBaseId?: string
  keyword?: string
}

/**
 * 定义文档上传参数结构。
 */
export type TDocumentsUploadInput<FileValue = File> = {
  knowledgeBaseId: string
  files: FileValue[]
}

/**
 * 定义按 ID 查询文档的参数结构。
 */
export type TDocumentIdInput = {
  id: string
}

/**
 * 定义批量删除文档参数结构。
 */
export type TRemoveDocumentsInput = {
  documentIds: string[]
}

/**
 * 定义下载原文件参数结构。
 */
export type TDownloadDocumentOriginalFileInput = {
  id: string
  fileName: string
  extension?: string
}

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
  indexStatus: TDocumentIndexStatus
  indexingError?: string
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
