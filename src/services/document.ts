import request from "@/lib/request"
import type {
  TDocumentListResult,
  TDocumentRecord,
  TRemoveDocumentsResult,
} from "@/types/documents"

export async function documnetsUpload(data: FormData) {
  return await request<TDocumentRecord[]>("/documents/upload", {
    method: "POST",
    data,
  })
}

export async function findAllDocuments(data: {
  page: number
  pageSize: number
  knowledgeBaseId?: string
}) {
  return await request<TDocumentListResult>("/documents", {
    method: "GET",
    params: data,
  })
}

export async function findDocumentById(data: { id: string }) {
  return await request<TDocumentRecord>(`/documents/${data.id}`, {
    method: "GET",
  })
}

export async function deleteDocumentById(data: { id: string }) {
  return await request<TDocumentRecord>(`/documents/${data.id}`, {
    method: "DELETE",
  })
}

export async function deleteAllDocumentById(data: { documentIds: string[] }) {
  return await request<TRemoveDocumentsResult>(`/documents/all`, {
    method: "DELETE",
    data,
  })
}
