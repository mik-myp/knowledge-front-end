import axios, {
  AxiosError,
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

// 是否正在刷新 Token
let isRefreshing = false
// 存储等待重试的请求队列
let requests = []

const getAccessToken = () => localStorage.getItem("accessToken")

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
  return Promise.reject(new Error(errorMessage))
}

const service = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : "http://120.26.21.10/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken")
  const response = await axios.post("/users/refresh", { refreshToken })
  return response.data.accessToken // 返回新的 accessToken
}

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers.set("Accept", "application/json")

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
  (response: AxiosResponse<ApiResponse>) => {
    if (response.data.code === 200) {
      return response.data.data
    }
    return createResponseError(response.data.code, response.data.message)
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const { config, response } = error

    const code = response?.data.code || response?.status

    const message = response?.data.message

    if (!response) {
      return createResponseError(code, message)
    }

    if (response.status === 401) {
      // 防止刷新接口自身也返回 401（死循环）
      if (config?.url?.includes("/users/refresh")) {
        redirectToLogin()
        return createResponseError(code, message)
      }

      // 将当前失败的请求存入队列
      const retryOriginalRequest = new Promise((resolve) => {
        requests.push({
          config, // 原始请求配置
          resolve, // 用于后续重试时 resolve
        })
      })
      // 如果已经在刷新 Token，直接返回等待 Promise
      if (isRefreshing) {
        return retryOriginalRequest
      }
      // 开始刷新 Token
      isRefreshing = true
      try {
        // 调用刷新 Token 的方法
        const newToken = await refreshToken()
        // 更新本地存储的 Token
        localStorage.setItem("accessToken", newToken)

        // 刷新成功后，重试队列中的所有请求
        requests.forEach(({ config, resolve }) => {
          // 更新请求头中的 Token
          config.headers.Authorization = `Bearer ${newToken}`
          // 重新发起请求，并 resolve 结果
          resolve(service(config))
        })

        // 清空队列
        requests = []

        // 重试当前请求（也可以直接用 retryOriginalRequest 返回，但队列中已包含当前请求）
        // 这里直接重新请求当前接口
        config.headers.Authorization = `Bearer ${newToken}`
        return service(config)
      } catch {
        // 刷新失败，清除 Token，跳转登录
        localStorage.removeItem("accessToken")
        redirectToLogin()
        return Promise.reject(createResponseError(code, message))
      } finally {
        isRefreshing = false
      }
    }
    return createResponseError(code, message)
  }
)

export default function request<T = unknown>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  return service({ url, ...options }) as Promise<T>
}
