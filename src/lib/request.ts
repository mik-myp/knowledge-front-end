import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios"
import { notification } from "@/lib/antdNotification"
import i18n from "@/lib/i18n"
import type { TokenPairResult } from "@/types/user"

/**
 * 描述后端统一响应体的结构。
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: string
  path: string
}

/**
 * 维护常见 HTTP 状态码与默认提示文案的映射关系。
 */
const statusMessageMap: Record<number, string> = {
  400: "request:status.400",
  401: "request:status.401",
  403: "request:status.403",
  404: "request:status.404",
  408: "request:status.408",
  500: "request:status.500",
  501: "request:status.501",
  502: "request:status.502",
  503: "request:status.503",
  504: "request:status.504",
}

/**
 * 表示请求层内部使用的认证令牌对。
 */
type AuthTokenPair = Pick<TokenPairResult, "accessToken" | "refreshToken">

/**
 * 缓存正在执行中的刷新令牌请求，避免并发重复刷新。
 */
let refreshPromise: Promise<AuthTokenPair> | null = null

/**
 * 移除字符串末尾多余的斜杠。
 * @param value 需要处理的地址字符串。
 * @returns 返回去掉尾部斜杠后的字符串。
 */
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

/**
 * 读取本地保存的访问令牌。
 * @returns 返回当前缓存的访问令牌，不存在时返回 `null`。
 */
export const getAccessToken = () => localStorage.getItem("accessToken")

/**
 * 读取本地保存的刷新令牌。
 * @returns 返回当前缓存的刷新令牌，不存在时返回 `null`。
 */
export const getRefreshToken = () => localStorage.getItem("refreshToken")

/**
 * 解析当前环境下的接口基础地址。
 * @returns 返回请求接口时使用的基础 URL。
 */
export const getRequestBaseURL = () => {
  const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim()

  if (configuredBaseURL) {
    return trimTrailingSlash(configuredBaseURL)
  }

  if (import.meta.env.DEV) {
    return "http://localhost:3000"
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return trimTrailingSlash(window.location.origin)
  }

  return ""
}

/**
 * 删除本地缓存的认证令牌。
 * @returns 清理完成后不返回额外内容。
 */
const clearTokens = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}

/**
 * 将新的认证令牌写入本地存储。
 * @param params 令牌数据。
 * @param params.accessToken 最新的访问令牌。
 * @param params.refreshToken 最新的刷新令牌。
 * @returns 写入完成后不返回额外内容。
 */
const saveTokens = ({ accessToken, refreshToken }: AuthTokenPair) => {
  localStorage.setItem("accessToken", accessToken)
  localStorage.setItem("refreshToken", refreshToken)
}

/**
 * 在浏览器环境下跳转到登录页。
 * @returns 跳转触发后不返回额外内容。
 */
const redirectToLogin = () => {
  if (typeof window === "undefined" || window.location.pathname === "/login") {
    return
  }

  window.location.replace("/login")
}

/**
 * 创建并上报请求错误。
 * @param code 响应状态码，可选。
 * @param message 后端返回的错误信息，可选。
 * @returns 返回一个带有最终提示文案的 `Error` 实例。
 */
const createResponseError = (code?: number, message?: string) => {
  const errorMessage =
    (typeof code === "number" && statusMessageMap[code]
      ? i18n.t(statusMessageMap[code])
      : undefined) ||
    message?.trim() ||
    i18n.t("errors.requestFailed", { ns: "request" })

  notification.error({
    title: i18n.t("notifications.requestFailedTitle", { ns: "request" }),
    description: errorMessage,
  })

  return new Error(errorMessage)
}

/**
 * 创建认证失败错误并清理当前登录状态。
 * @param message 认证失败时的提示信息，可选。
 * @returns 返回一个认证失败对应的 `Error` 实例。
 */
const createAuthError = (message?: string) => {
  clearTokens()
  redirectToLogin()

  return createResponseError(401, message)
}

/**
 * 封装全局默认配置后的 Axios 实例。
 */
const service = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : `${getRequestBaseURL()}/`,
  timeout: 10000,
})

/**
 * 刷新认证令牌。
 * @returns 返回 Promise，解析后得到认证令牌对。
 */
async function refreshToken(): Promise<AuthTokenPair> {
  const savedRefreshToken = getRefreshToken()

  if (!savedRefreshToken) {
    throw new Error(i18n.t("errors.authRequired", { ns: "request" }))
  }

  const response = await axios.post<ApiResponse<TokenPairResult>>(
    "/users/refresh",
    { refreshToken: savedRefreshToken },
    {
      baseURL: service.defaults.baseURL,
      timeout: service.defaults.timeout,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  )

  const tokenPair = response.data.data

  if (
    response.data.code !== 200 ||
    !tokenPair?.accessToken ||
    !tokenPair.refreshToken
  ) {
    throw new Error(
      response.data.message?.trim() ||
        i18n.t("errors.refreshFailed", { ns: "request" })
    )
  }

  const nextTokens = {
    accessToken: tokenPair.accessToken,
    refreshToken: tokenPair.refreshToken,
  }

  saveTokens(nextTokens)

  return nextTokens
}

/**
 * 刷新当前认证会话。
 * @returns 返回 Promise，解析后得到认证令牌对。
 */
const refreshAuthSession = async (): Promise<AuthTokenPair> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return await refreshToken()
      } catch (error) {
        throw createAuthError(
          error instanceof Error
            ? error.message
            : i18n.t("errors.refreshFailed", { ns: "request" })
        )
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers.set("Accept", "application/json")

    if (config.data instanceof FormData) {
      config.headers.set("Content-Type", "multipart/form-data")
    } else {
      config.headers.set("Content-Type", "application/json")
    }

    const accessToken = getAccessToken()

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`)
    }

    return config
  },
  (error: AxiosError) => {
    notification.error({
      title: i18n.t("errors.requestSendFailed", { ns: "request" }),
      description: error.message,
    })

    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    if (response.data.code !== 200) {
      return Promise.reject(
        createResponseError(response.data.code, response.data.message)
      )
    }

    return response
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const { config, response } = error
    const code = response?.data.code ?? response?.status
    const message = response?.data.message ?? error.message

    if (!response) {
      return Promise.reject(createResponseError(code, message))
    }

    if (response.status !== 401) {
      return Promise.reject(createResponseError(code, message))
    }

    if (config?.url?.includes("/users/refresh")) {
      return Promise.reject(createAuthError(message))
    }

    if (!config) {
      return Promise.reject(createAuthError(message))
    }

    try {
      const { accessToken } = await refreshAuthSession()
      config.headers.set("Authorization", `Bearer ${accessToken}`)

      return service(config)
    } catch (refreshError) {
      return Promise.reject(
        refreshError instanceof Error ? refreshError : createAuthError(message)
      )
    }
  }
)

/**
 * 构建 Fetch 请求头。
 * @param headers headers。
 * @param body 请求体数据。
 * @param accessToken 访问令牌。
 * @returns 返回Headers。
 */
const buildFetchHeaders = (
  headers?: HeadersInit,
  body?: BodyInit | null,
  accessToken?: string
): Headers => {
  const nextHeaders = new Headers(headers)

  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", "application/json")
  }

  if (body && !(body instanceof FormData) && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json")
  }

  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`)
  }

  return nextHeaders
}

/**
 * 发送带认证能力的 Fetch 请求。
 * @param input 请求输入。
 * @param init 请求初始化配置。
 * @returns 返回 Promise，解析后得到响应。
 */
export const authorizedFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const executeRequest = async (accessToken?: string): Promise<Response> => {
    return fetch(input, {
      ...init,
      headers: buildFetchHeaders(init?.headers, init?.body, accessToken),
    })
  }

  const firstResponse = await executeRequest(getAccessToken() ?? undefined)

  if (firstResponse.status !== 401) {
    return firstResponse
  }

  if (typeof input === "string" && input.includes("/users/refresh")) {
    throw createAuthError(i18n.t("errors.authRequired", { ns: "request" }))
  }

  const { accessToken } = await refreshAuthSession()
  const retryResponse = await executeRequest(accessToken)

  if (retryResponse.status === 401) {
    throw createAuthError(i18n.t("errors.authRequired", { ns: "request" }))
  }

  return retryResponse
}

/**
 * 请求 Blob 数据。
 * @param input 请求输入。
 * @param init 请求初始化配置。
 * @returns 返回 Promise，解析后得到Blob。
 */
export const requestBlob = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Blob> => {
  const response = await authorizedFetch(input, init)

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as Partial<ApiResponse<unknown>>

      throw createResponseError(
        payload.code ?? response.status,
        payload.message ?? response.statusText
      )
    }

    throw createResponseError(response.status, response.statusText)
  }

  return response.blob()
}

/**
 * 发送统一格式的请求。
 * @param url URL。
 * @param options 配置项。
 * @returns 返回 Promise，解析后得到T。
 */
export default async function request<T = unknown>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const response = await service.request<ApiResponse<T>>({ url, ...options })
  return response.data.data
}
