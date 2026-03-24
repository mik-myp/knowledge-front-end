import request from "@/lib/request"
import type {
  TChatAskRequest,
  TChatMessageRecord,
  TChatRecord,
} from "@/types/chat"

export async function findAllSession() {
  return await request<TChatRecord[]>("/chat/sessions", {
    method: "GET",
  })
}

export async function createSession(data: {
  knowledgeBaseId?: string
  title: string
}) {
  return await request<TChatRecord>("/chat/sessions", {
    method: "POST",
    data,
  })
}

export async function updateSession(data: { id: string; title: string }) {
  return await request<TChatRecord>(`/chat/sessions/${data.id}`, {
    method: "PATCH",
    data: {
      title: data.title,
    },
  })
}

export async function removeSession(data: { id: string }) {
  return await request<TChatRecord>(`/chat/sessions/${data.id}`, {
    method: "DELETE",
  })
}

export async function getHistoryMessages(data: { sessionId: string }) {
  return await request<TChatMessageRecord[]>("/chat/messages", {
    method: "GET",
    params: data,
  })
}

export async function askChat(data: TChatAskRequest, signal?: AbortSignal) {
  return await request<unknown>("/chat/ask", {
    method: "POST",
    data,
    signal,
  })
}
