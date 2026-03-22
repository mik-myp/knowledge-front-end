export type TDocumentRecord = {
  id: string
  userId: string
  knowledgeBaseId: string
  originalName?: string
  extension: number
  fileType: number
  mimeType?: string
  size: number
  status: string
}
