import request from "@/lib/request"
import type { TDocumentRecord } from "@/types/documents"

export async function documnetsUpload(data: FormData) {
  return await request("/documnets/upload", {
    method: "POST",
    data,
  })
}

export async function findAllDocuments(data: {
  page: number
  pageSize: number
}) {
  return await request<{
    dataList: TDocumentRecord[]
    total: number
  }>("/documnets/all", {
    method: "GET",
    data,
  })
}
