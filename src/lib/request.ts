import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"
import { toast } from "sonner"

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

type PendingRequest = {
  config: InternalAxiosRequestConfig
  resolve: (
    value:
      | AxiosResponse<ApiResponse<unknown>>
      | PromiseLike<AxiosResponse<ApiResponse<unknown>>>
  ) => void
  reject: (reason?: unknown) => void
}

let isRefreshing = false
let pendingRequests: PendingRequest[] = []

const getAccessToken = () => localStorage.getItem("accessToken")

const clearTokens = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
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

  toast.error(errorMessage)
  return new Error(errorMessage)
}

const service = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : "http://120.26.21.10/",
  timeout: 10000,
})

async function refreshToken() {
  const savedRefreshToken = localStorage.getItem("refreshToken")

  if (!savedRefreshToken) {
    throw new Error("未授权，请重新登录")
  }

  const response = await axios.post<ApiResponse<{ accessToken: string }>>(
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

  if (response.data.code !== 200 || !response.data.data?.accessToken) {
    throw new Error(response.data.message?.trim() || "刷新登录状态失败")
  }

  return response.data.data.accessToken
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
    toast.error("请求发送失败")
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
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
      clearTokens()
      redirectToLogin()
      return Promise.reject(createResponseError(code, message))
    }

    if (!config) {
      redirectToLogin()
      return Promise.reject(createResponseError(code, message))
    }

    const retryOriginalRequest = new Promise<
      AxiosResponse<ApiResponse<unknown>>
    >((resolve, reject) => {
      pendingRequests.push({
        config,
        resolve,
        reject,
      })
    })

    if (isRefreshing) {
      return retryOriginalRequest
    }

    isRefreshing = true

    try {
      const newToken = await refreshToken()
      localStorage.setItem("accessToken", newToken)

      const currentPendingRequests = pendingRequests
      pendingRequests = []

      currentPendingRequests.forEach(({ config, resolve }) => {
        config.headers.set("Authorization", `Bearer ${newToken}`)
        resolve(service(config))
      })

      return retryOriginalRequest
    } catch (refreshError) {
      clearTokens()

      const handledError = createResponseError(
        code ?? 401,
        refreshError instanceof Error ? refreshError.message : message
      )

      const currentPendingRequests = pendingRequests
      pendingRequests = []

      currentPendingRequests.forEach(({ reject }) => {
        reject(handledError)
      })

      redirectToLogin()
      return retryOriginalRequest
    } finally {
      isRefreshing = false
    }
  }
)

export default async function request<T = unknown>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const response = await service.request<ApiResponse<T>>({ url, ...options })
  return response.data.data
}
