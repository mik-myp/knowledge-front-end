import request from "@/lib/request"
import {
  ensureObjectId,
  normalizeCreateKnowledgeBaseInput,
  normalizeListKnowledgeBasesQuery,
  normalizeUpdateKnowledgeBaseInput,
  type CreateKnowledgeBaseInput,
  type ListKnowledgeBasesQuery,
} from "@/contracts/api-contracts"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"

/**
 * 创建知识库。
 * @param data 创建参数，包含知识库名称和描述。
 * @returns 返回新建后的知识库记录。
 */
export async function createKnowledge(data: CreateKnowledgeBaseInput) {
  return await request<TKnowledgeBaseRecord>("/knowledge-bases", {
    method: "POST",
    data: normalizeCreateKnowledgeBaseInput(data),
  })
}

/**
 * 分页获取知识库列表。
 * @param data 查询参数，包含页码和每页条数。
 * @returns 返回知识库列表以及总数。
 */
export async function getKnowledges(data: ListKnowledgeBasesQuery) {
  return await request<{
    dataList: TKnowledgeBaseRecord[]
    total: number
  }>("/knowledge-bases", {
    params: normalizeListKnowledgeBasesQuery(data),
  })
}

/**
 * 获取当前用户的全部知识库。
 * @returns 返回所有知识库记录列表。
 */
export async function getAllKnowledges() {
  return await request<TKnowledgeBaseRecord[]>("/knowledge-bases")
}

/**
 * 获取单个知识库详情。
 * @param data 查询参数。
 * @param data.id 需要查询的知识库 ID。
 * @returns 返回对应的知识库记录。
 */
export async function getKnowledgeById(data: { id: string }) {
  const id = ensureObjectId(data.id, "id")

  return await request<TKnowledgeBaseRecord>(`/knowledge-bases/${id}`)
}

/**
 * 更新指定知识库。
 * @param data 更新参数。
 * @param data.id 需要更新的知识库 ID。
 * @param data.name 知识库名称。
 * @param data.description 知识库描述，可选。
 * @returns 返回更新后的知识库记录。
 */
export async function updateKnowledgeById(data: {
  id: string
  name: string
  description?: string
}) {
  const id = ensureObjectId(data.id, "id")

  return await request<TKnowledgeBaseRecord>(`/knowledge-bases/${id}`, {
    method: "PATCH",
    data: normalizeUpdateKnowledgeBaseInput({
      name: data.name,
      description: data.description,
    }),
  })
}

/**
 * 删除指定知识库。
 * @param data 删除参数。
 * @param data.id 需要删除的知识库 ID。
 * @returns 返回被删除的知识库记录。
 */
export async function deleteKnowledgeById(data: { id: string }) {
  const id = ensureObjectId(data.id, "id")

  return await request<TKnowledgeBaseRecord>(`/knowledge-bases/${id}`, {
    method: "DELETE",
  })
}
