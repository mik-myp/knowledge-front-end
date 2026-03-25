import { getRequestBaseURL, requestBlob } from "@/lib/request"
import { downloadBlob } from "@/lib/utils"
import request from "@/lib/request"
import type {
  TDocumentListResult,
  TDocumentRecord,
  TRemoveDocumentsResult,
} from "@/types/documents"

const getDocumentDownloadUrl = (id: string) =>
  import.meta.env.DEV
    ? `/api/documents/${id}/download`
    : `${getRequestBaseURL()}/documents/${id}/download`

const buildDownloadFileName = (fileName: string, extension?: string) => {
  const trimmedFileName = fileName.trim()
  const trimmedExtension = extension?.trim().toLowerCase()

  if (!trimmedExtension) {
    return trimmedFileName
  }

  return trimmedFileName.toLowerCase().endsWith(`.${trimmedExtension}`)
    ? trimmedFileName
    : `${trimmedFileName}.${trimmedExtension}`
}

export async function documentsUpload(data: FormData) {
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

export async function fetchDocumentFile(data: { id: string }) {
  return await requestBlob(getDocumentDownloadUrl(data.id), {
    method: "GET",
  })
}

export async function downloadDocumentOriginalFile(data: {
  id: string
  fileName: string
  extension?: string
}) {
  const blob = await fetchDocumentFile({ id: data.id })
  downloadBlob(blob, buildDownloadFileName(data.fileName, data.extension))
}
