import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios"
import { notification } from "@/lib/antdNotification"
import type { TokenPairResult } from "@/types/user"

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: string
  path: string
}

const statusMessageMap: Record<number, string> = {
  400: "请求参数错误",
  401: "未授权，请重新登录",
  403: "拒绝访问",
  404: "请求资源不存在",
  408: "请求超时",
  500: "服务器开小差了，请稍后重试",
  501: "服务暂未实现",
  502: "网关错误",
  503: "服务暂不可用",
  504: "网关超时",
}

type AuthTokenPair = Pick<TokenPairResult, "accessToken" | "refreshToken">

let refreshPromise: Promise<AuthTokenPair> | null = null

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

export const getAccessToken = () => localStorage.getItem("accessToken")
export const getRefreshToken = () => localStorage.getItem("refreshToken")
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

const clearTokens = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}

const saveTokens = ({ accessToken, refreshToken }: AuthTokenPair) => {
  localStorage.setItem("accessToken", accessToken)
  localStorage.setItem("refreshToken", refreshToken)
}

const redirectToLogin = () => {
  if (typeof window === "undefined" || window.location.pathname === "/login") {
    return
  }

  window.location.replace("/login")
}

const createResponseError = (code?: number, message?: string) => {
  const errorMessage =
    (typeof code === "number" ? statusMessageMap[code] : undefined) ||
    message?.trim() ||
    "请求失败"

  notification.error({
    title: "请求失败",
    description: errorMessage,
  })

  return new Error(errorMessage)
}

const createAuthError = (message?: string) => {
  clearTokens()
  redirectToLogin()

  return createResponseError(401, message)
}

const service = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : `${getRequestBaseURL()}/`,
  timeout: 10000,
})

async function refreshToken(): Promise<AuthTokenPair> {
  const savedRefreshToken = getRefreshToken()

  if (!savedRefreshToken) {
    throw new Error("未授权，请重新登录")
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
    throw new Error(response.data.message?.trim() || "刷新登录状态失败")
  }

  const nextTokens = {
    accessToken: tokenPair.accessToken,
    refreshToken: tokenPair.refreshToken,
  }

  saveTokens(nextTokens)

  return nextTokens
}

const refreshAuthSession = async (): Promise<AuthTokenPair> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return await refreshToken()
      } catch (error) {
        throw createAuthError(
          error instanceof Error ? error.message : "刷新登录状态失败"
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
      title: "请求发送失败",
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
    throw createAuthError("未授权，请重新登录")
  }

  const { accessToken } = await refreshAuthSession()
  const retryResponse = await executeRequest(accessToken)

  if (retryResponse.status === 401) {
    throw createAuthError("未授权，请重新登录")
  }

  return retryResponse
}

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

export default async function request<T = unknown>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const response = await service.request<ApiResponse<T>>({ url, ...options })
  return response.data.data
}
