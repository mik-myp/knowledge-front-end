import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
