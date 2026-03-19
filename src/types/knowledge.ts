export type TKnowledgeBaseRecord = {
  id: string
  userId: string
  name: string
  description?: string
  documentCount: number
  chunkCount: number
  lastIndexedAt?: Date
}
