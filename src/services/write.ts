import i18n from "@/lib/i18n"
import {
  authorizedFetch,
  getRequestBaseURL,
  type ApiResponse,
} from "@/lib/request"
import type { TAIWriteConfig, TWriteStreamChunk } from "@/types/write"

const startWriteStreamUrl = `${getRequestBaseURL()}/write/start`

type StartWriteStreamOptions = {
  signal?: AbortSignal
  onChunk?: (chunk: TWriteStreamChunk) => void
}

const getStreamErrorMessage = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as Partial<ApiResponse<unknown>>

    return (
      payload.message?.trim() ||
      i18n.t("errors.requestFailed", { ns: "request" })
    )
  }

  return (
    response.statusText || i18n.t("errors.requestFailed", { ns: "request" })
  )
}

const parseStreamChunk = (eventBlock: string): TWriteStreamChunk | null => {
  const dataLines = eventBlock
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())

  if (!dataLines.length) {
    return null
  }

  const payload = dataLines.join("\n")

  if (!payload) {
    return null
  }

  try {
    return JSON.parse(payload) as TWriteStreamChunk
  } catch {
    return null
  }
}

export async function startWriteStream(
  data: TAIWriteConfig,
  options?: StartWriteStreamOptions
) {
  const response = await authorizedFetch(startWriteStreamUrl, {
    body: JSON.stringify(data),
    method: "POST",
    signal: options?.signal,
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(await getStreamErrorMessage(response))
  }

  if (!response.body) {
    throw new Error(i18n.t("errors.requestFailed", { ns: "request" }))
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })

      const eventBlocks = buffer.split(/\r?\n\r?\n/)
      buffer = eventBlocks.pop() ?? ""

      for (const eventBlock of eventBlocks) {
        const chunk = parseStreamChunk(eventBlock)

        if (!chunk) {
          continue
        }

        options?.onChunk?.(chunk)

        if (chunk.done) {
          return
        }
      }
    }

    const trailingChunk = parseStreamChunk(buffer)

    if (trailingChunk) {
      options?.onChunk?.(trailingChunk)
    }
  } finally {
    reader.releaseLock()
  }
}
