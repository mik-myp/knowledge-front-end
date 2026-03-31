import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TDocumentIndexStatus } from "@/types/documents"
import i18n from "@/lib/i18n"

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
      label: i18n.t("indexStatusMeta.pending.label", { ns: "document" }),
      color: "default",
      hint: i18n.t("indexStatusMeta.pending.hint", { ns: "document" }),
    }
  }

  if (status === "indexing") {
    return {
      label: i18n.t("indexStatusMeta.indexing.label", { ns: "document" }),
      color: "processing",
      hint: i18n.t("indexStatusMeta.indexing.hint", { ns: "document" }),
    }
  }

  if (status === "failed") {
    return {
      label: i18n.t("indexStatusMeta.failed.label", { ns: "document" }),
      color: "error",
      hint: i18n.t("indexStatusMeta.failed.hint", { ns: "document" }),
    }
  }

  return {
    label: i18n.t("indexStatusMeta.completed.label", { ns: "document" }),
    color: "success",
    hint: i18n.t("indexStatusMeta.completed.hint", { ns: "document" }),
  }
}
