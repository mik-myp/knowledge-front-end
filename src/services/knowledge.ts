import request from "@/lib/request"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"

export async function createKnowledge(data: {
  name: string
  description?: string
}) {
  return await request<TKnowledgeBaseRecord>("/knowledge-bases", {
    method: "POST",
    data,
  })
}

export async function getKnowledges(data: { page: number; pageSize: number }) {
  return await request<{
    dataList: TKnowledgeBaseRecord[]
    total: number
  }>("/knowledge-bases", {
    params: data,
  })
}

export async function getKnowledgeById(data: { id: string }) {
  return await request<TKnowledgeBaseRecord>(`/knowledge-bases/${data.id}`)
}

export async function updateKnowledgeById(data: {
  id: string
  name: string
  description?: string
}) {
  return await request<TKnowledgeBaseRecord>(`/knowledge-bases/${data.id}`, {
    method: "PATCH",
    data,
  })
}

export async function deleteKnowledgeById(data: { id: string }) {
  return await request<TKnowledgeBaseRecord>(`/knowledge-bases/${data.id}`, {
    method: "DELETE",
  })
}
