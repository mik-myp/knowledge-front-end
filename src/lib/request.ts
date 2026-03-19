import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"
import { toast } from "sonner"

import useUser from "@/stores/useUser"

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: string
  path: string
}

interface RequestInstance extends AxiosInstance {
  <T = unknown, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  <T = unknown, D = unknown>(config: AxiosRequestConfig<D>): Promise<T>
  request<T = unknown, D = unknown>(config: AxiosRequestConfig<D>): Promise<T>
  get<T = unknown, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  delete<T = unknown, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  head<T = unknown, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  options<T = unknown, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
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

const isApiResponse = <T = unknown>(
  value: unknown
): value is ApiResponse<T> => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ApiResponse<T>).code === "number" &&
    typeof (value as ApiResponse<T>).message === "string" &&
    "data" in value &&
    typeof (value as ApiResponse<T>).timestamp === "string" &&
    typeof (value as ApiResponse<T>).path === "string"
  )
}

const createResponseError = (code?: number, message?: string): Error => {
  if (code === 401) {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    useUser.getState().setUser(null)

    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.replace("/login")
    }
  }

  const errorMessage =
    (typeof code === "number" ? statusMessageMap[code] : undefined) ||
    message?.trim() ||
    "请求失败"

  toast.error(errorMessage)

  return new Error(errorMessage)
}

const request = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : "http://120.26.21.10/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
}) as RequestInstance

const handleResponseData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!isApiResponse<T>(response.data)) {
    const errorMessage = "接口返回格式不正确"
    toast.error(errorMessage)
    throw new Error(errorMessage)
  }

  if (response.data.code !== 200) {
    throw createResponseError(response.data.code, response.data.message)
  }

  return response.data.data
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    config.headers.set("Accept", "application/json")

    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`)
    }

    return config
  },
  (error: AxiosError): Promise<never> => {
    toast.error("请求发送失败")
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  handleResponseData as Parameters<typeof request.interceptors.response.use>[0],
  (error: AxiosError<ApiResponse<unknown>>): Promise<never> => {
    const responseData = error.response?.data
    const code =
      (isApiResponse(responseData) ? responseData.code : undefined) ??
      error.response?.status
    const message = isApiResponse(responseData)
      ? responseData.message
      : undefined

    return Promise.reject(createResponseError(code, message))
  }
)

export default request
