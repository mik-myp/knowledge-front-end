import request from "@/lib/request"
import type {
  TChatSessionIdInput,
  TCreateChatSessionInput,
  TFindChatMessagesQuery,
  TChatMessageRecord,
  TChatRecord,
  TUpdateChatSessionInput,
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
export async function createSession(data: TCreateChatSessionInput) {
  return await request<TChatRecord>("/chat/sessions", {
    method: "POST",
    data,
  })
}

/**
 * 更新指定会话的标题。
 * @param data 会话更新参数。
 * @param data.id 需要更新的会话 ID。
 * @param data.title 会话的新标题。
 * @returns 返回更新后的会话记录。
 */
export async function updateSession(data: TUpdateChatSessionInput) {
  return await request<TChatRecord>(`/chat/sessions/${data.id}`, {
    method: "PATCH",
    data: {
      title: data.title,
    },
  })
}

/**
 * 删除指定会话。
 * @param data 删除参数。
 * @param data.id 需要删除的会话 ID。
 * @returns 返回被删除的会话记录。
 */
export async function removeSession(data: TChatSessionIdInput) {
  return await request<TChatRecord>(`/chat/sessions/${data.id}`, {
    method: "DELETE",
  })
}

/**
 * 获取指定会话的历史消息。
 * @param data 查询参数。
 * @param data.sessionId 需要查询的会话 ID。
 * @returns 返回该会话下的消息列表。
 */
export async function getHistoryMessages(data: TFindChatMessagesQuery) {
  return await request<TChatMessageRecord[]>("/chat/messages", {
    method: "GET",
    params: data,
  })
}
