import { getRequestBaseURL, requestBlob } from "@/lib/request"
import { downloadBlob } from "@/lib/utils"
import request from "@/lib/request"
import {
  ensureObjectId,
  normalizeListDocumentsQuery,
  normalizeRemoveDocumentsInput,
  normalizeUploadDocumentsInput,
  type ListDocumentsQuery,
  type UploadDocumentsInput,
} from "@/contracts/api-contracts"
import type {
  TDocumentListResult,
  TDocumentRecord,
  TRemoveDocumentsResult,
} from "@/types/documents"

/**
 * 生成文档原文件的下载地址。
 * @param id 文档 ID。
 * @returns 返回用于下载原文件的完整地址。
 */
const getDocumentDownloadUrl = (id: string) =>
  import.meta.env.DEV
    ? `/api/documents/${id}/download`
    : `${getRequestBaseURL()}/documents/${id}/download`

/**
 * 生成下载时使用的文件名。
 * @param fileName 文档原始名称。
 * @param extension 文档扩展名，可选。
 * @returns 返回补齐扩展名后的文件名。
 */
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

/**
 * 上传文档文件。
 * @param data 上传参数，包含所属知识库 ID 和文件列表。
 * @returns 返回上传成功后的文档记录列表。
 */
export async function documentsUpload(data: UploadDocumentsInput<File>) {
  const normalizedPayload = normalizeUploadDocumentsInput(data)
  const formData = new FormData()

  normalizedPayload.files.forEach((file) => {
    formData.append("files", file)
  })
  formData.append("knowledgeBaseId", normalizedPayload.knowledgeBaseId)

  return await request<TDocumentRecord[]>("/documents/upload", {
    method: "POST",
    data: formData,
  })
}

/**
 * 分页查询文档列表。
 * @param data 查询参数，包含分页、知识库过滤和关键字筛选条件。
 * @returns 返回文档列表和总数。
 */
export async function findAllDocuments(data: ListDocumentsQuery) {
  return await request<TDocumentListResult>("/documents", {
    method: "GET",
    params: normalizeListDocumentsQuery(data),
  })
}

/**
 * 获取单个文档详情。
 * @param data 查询参数。
 * @param data.id 需要查询的文档 ID。
 * @returns 返回对应的文档详情。
 */
export async function findDocumentById(data: { id: string }) {
  const id = ensureObjectId(data.id, "id")

  return await request<TDocumentRecord>(`/documents/${id}`, {
    method: "GET",
  })
}

/**
 * 删除单个文档。
 * @param data 删除参数。
 * @param data.id 需要删除的文档 ID。
 * @returns 返回被删除的文档记录。
 */
export async function deleteDocumentById(data: { id: string }) {
  const id = ensureObjectId(data.id, "id")

  return await request<TDocumentRecord>(`/documents/${id}`, {
    method: "DELETE",
  })
}

/**
 * 批量删除文档。
 * @param data 删除参数。
 * @param data.documentIds 需要删除的文档 ID 列表。
 * @returns 返回批量删除结果，包含成功数量和文档 ID 列表。
 */
export async function deleteAllDocumentById(data: { documentIds: string[] }) {
  return await request<TRemoveDocumentsResult>(`/documents/all`, {
    method: "DELETE",
    data: normalizeRemoveDocumentsInput(data),
  })
}

/**
 * 获取文档原文件的二进制内容。
 * @param data 查询参数。
 * @param data.id 需要下载的文档 ID。
 * @returns 返回文档文件对应的 Blob 数据。
 */
export async function fetchDocumentFile(data: { id: string }) {
  const id = ensureObjectId(data.id, "id")

  return await requestBlob(getDocumentDownloadUrl(id), {
    method: "GET",
  })
}

/**
 * 下载文档原文件到浏览器本地。
 * @param data 下载参数。
 * @param data.id 需要下载的文档 ID。
 * @param data.fileName 下载时展示的基础文件名。
 * @param data.extension 文档扩展名，可选。
 * @returns 下载触发后不返回额外数据。
 */
export async function downloadDocumentOriginalFile(data: {
  id: string
  fileName: string
  extension?: string
}) {
  const blob = await fetchDocumentFile({ id: data.id })
  downloadBlob(blob, buildDownloadFileName(data.fileName, data.extension))
}
