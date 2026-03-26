/**
 * 定义知识库基础的数据记录结构。
 */
export type TKnowledgeBaseRecord = {
  id: string
  userId: string
  name: string
  description?: string
}

/**
 * 定义创建知识库的参数结构。
 */
export type TCreateKnowledgeInput = {
  name: string
  description?: string
}

/**
 * 定义更新知识库的参数结构。
 */
export type TUpdateKnowledgeInput = {
  id: string
  name: string
  description?: string
}

/**
 * 定义按 ID 查询或删除知识库的参数结构。
 */
export type TKnowledgeIdInput = {
  id: string
}

/**
 * 定义知识库列表查询参数结构。
 */
export type TListKnowledgesQuery = {
  page?: number
  pageSize?: number
}

/**
 * 定义分页知识库列表结果结构。
 */
export type TKnowledgeListResult = {
  dataList: TKnowledgeBaseRecord[]
  total: number
}
