export type TDocumentSourceType = "upload" | "editor"

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

export type TDocumentListRecord = TDocumentRecord & {
  knowledgeBaseName: string
}

export type TDocumentListResult = {
  dataList: TDocumentListRecord[]
  total: number
}

export type TRemoveDocumentsResult = {
  deletedCount: number
  deletedIds: string[]
}
