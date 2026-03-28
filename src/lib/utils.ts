import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TDocumentIndexStatus } from "@/types/documents"

/**
 * 合并并去重 Tailwind 类名。
 * @param inputs 需要合并的类名片段。
 * @returns 返回最终可直接挂到组件上的类名字符串。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 触发浏览器下载 Blob 文件。
 * @param blob 需要下载的二进制文件数据。
 * @param fileName 下载时使用的文件名。
 * @returns 下载触发后不返回额外内容。
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = objectUrl
  anchor.download = fileName
  anchor.style.display = "none"

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(objectUrl)
}

/**
 * 将字节数格式化为适合展示的文件大小字符串。
 * @param bytes 文件大小，单位为字节。
 * @returns 返回带单位的格式化结果。
 */
export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B"
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

type TDocumentIndexStatusMeta = {
  label: string
  color: "default" | "processing" | "success" | "error"
  hint: string
}

/**
 * 获取文档索引状态的展示信息。
 * @param status 文档当前索引状态。
 * @returns 返回状态文案、颜色与补充提示。
 */
export function getDocumentIndexStatusMeta(
  status: TDocumentIndexStatus
): TDocumentIndexStatusMeta {
  if (status === "pending") {
    return {
      label: "待索引",
      color: "default",
      hint: "文档已入库，等待开始索引。",
    }
  }

  if (status === "indexing") {
    return {
      label: "索引中",
      color: "processing",
      hint: "正在处理文档内容，暂时可能无法检索。",
    }
  }

  if (status === "failed") {
    return {
      label: "失败",
      color: "error",
      hint: "索引失败，当前文档不会出现在检索结果中。",
    }
  }

  return {
    label: "已完成",
    color: "success",
    hint: "索引已完成，文档可参与检索。",
  }
}
