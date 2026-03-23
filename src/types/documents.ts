export type TDocumentRecord = {
  id: string
  userId: string
  knowledgeBaseId: string
  knowledgeBaseName: string
  originalName?: string
  extension: string
  mimeType?: string
  size: number
  sourceType: "upload" | "editor"
  content?: string
  createdAt: string
  updatedAt: string
}
