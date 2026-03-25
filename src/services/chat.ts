import request from "@/lib/request"
import {
  ensureObjectId,
  normalizeAskChatInput,
  normalizeCreateChatSessionInput,
  normalizeFindChatMessagesQuery,
  normalizeUpdateChatSessionInput,
  type CreateChatSessionInput,
} from "@/contracts/api-contracts"
import type {
  TChatAskRequest,
  TChatMessageRecord,
  TChatRecord,
} from "@/types/chat"

/**
 * 获取当前用户的全部会话列表。
 * @returns 返回当前用户的对话会话列表。
 */
export async function findAllSession() {
  return await request<TChatRecord[]>("/chat/sessions", {
    method: "GET",
  })
}

/**
 * 创建新的对话会话。
 * @param data 会话创建参数，可包含知识库 ID 和初始标题。
 * @returns 返回新建后的会话记录。
 */
export async function createSession(data: CreateChatSessionInput) {
  return await request<TChatRecord>("/chat/sessions", {
    method: "POST",
    data: normalizeCreateChatSessionInput(data),
  })
}

/**
 * 更新指定会话的标题。
 * @param data 会话更新参数。
 * @param data.id 需要更新的会话 ID。
 * @param data.title 会话的新标题。
 * @returns 返回更新后的会话记录。
 */
export async function updateSession(data: { id: string; title: string }) {
  const id = ensureObjectId(data.id, "id")

  return await request<TChatRecord>(`/chat/sessions/${id}`, {
    method: "PATCH",
    data: normalizeUpdateChatSessionInput({
      title: data.title,
    }),
  })
}

/**
 * 删除指定会话。
 * @param data 删除参数。
 * @param data.id 需要删除的会话 ID。
 * @returns 返回被删除的会话记录。
 */
export async function removeSession(data: { id: string }) {
  const id = ensureObjectId(data.id, "id")

  return await request<TChatRecord>(`/chat/sessions/${id}`, {
    method: "DELETE",
  })
}

/**
 * 获取指定会话的历史消息。
 * @param data 查询参数。
 * @param data.sessionId 需要查询的会话 ID。
 * @returns 返回该会话下的消息列表。
 */
export async function getHistoryMessages(data: { sessionId: string }) {
  return await request<TChatMessageRecord[]>("/chat/messages", {
    method: "GET",
    params: normalizeFindChatMessagesQuery(data),
  })
}

/**
 * 发起问答请求。
 * @param data 问答请求参数，包含消息列表、会话信息和检索配置。
 * @param signal 可选的取消信号，用于中断正在进行的请求。
 * @returns 返回问答接口的原始响应数据。
 */
export async function askChat(data: TChatAskRequest, signal?: AbortSignal) {
  return await request<unknown>("/chat/ask", {
    method: "POST",
    data: normalizeAskChatInput(data),
    signal,
  })
}
