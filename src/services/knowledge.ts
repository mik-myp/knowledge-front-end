import request from "@/lib/request"
import type {
  TCreateKnowledgeInput,
  TKnowledgeBaseRecord,
  TKnowledgeIdInput,
  TKnowledgeListResult,
  TListKnowledgesQuery,
  TUpdateKnowledgeInput,
} from "@/types/knowledge"

/**
 * 创建知识库。
 * @param data 创建参数，包含知识库名称和描述。
 * @returns 返回新建后的知识库记录。
 */
export async function createKnowledge(data: TCreateKnowledgeInput) {
  return await request<TKnowledgeBaseRecord>("/knowledge-bases", {
    method: "POST",
    data,
  })
}

/**
 * 分页获取知识库列表。
 * @param data 查询参数，包含页码和每页条数。
 * @returns 返回知识库列表以及总数。
 */
export async function getKnowledges(data: TListKnowledgesQuery) {
  return await request<TKnowledgeListResult>("/knowledge-bases", {
    params: data,
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
export async function getKnowledgeById(data: TKnowledgeIdInput) {
  return await request<TKnowledgeBaseRecord>(`/knowledge-bases/${data.id}`)
}

/**
 * 更新指定知识库。
 * @param data 更新参数。
 * @param data.id 需要更新的知识库 ID。
 * @param data.name 知识库名称。
 * @param data.description 知识库描述，可选。
 * @returns 返回更新后的知识库记录。
 */
export async function updateKnowledgeById(data: TUpdateKnowledgeInput) {
  return await request<TKnowledgeBaseRecord>(`/knowledge-bases/${data.id}`, {
    method: "PATCH",
    data: {
      name: data.name,
      description: data.description,
    },
  })
}

/**
 * 删除指定知识库。
 * @param data 删除参数。
 * @param data.id 需要删除的知识库 ID。
 * @returns 返回被删除的知识库记录。
 */
export async function deleteKnowledgeById(data: TKnowledgeIdInput) {
  return await request<TKnowledgeBaseRecord>(`/knowledge-bases/${data.id}`, {
    method: "DELETE",
  })
}
