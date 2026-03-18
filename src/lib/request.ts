import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"
import { toast } from "sonner"

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

const SUCCESS_CODE = 200

const STATUS_MESSAGE_MAP: Record<number, string> = {
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const isApiResponse = (value: unknown): value is ApiResponse<unknown> => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.code === "number" &&
    typeof value.message === "string" &&
    "data" in value &&
    typeof value.timestamp === "string" &&
    typeof value.path === "string"
  )
}

const createRequestError = (message: string): Error => {
  return new Error(message)
}

const getStatusMessage = (code?: number, message?: string): string => {
  if (typeof message === "string" && message.trim()) {
    return message
  }

  if (typeof code === "number" && STATUS_MESSAGE_MAP[code]) {
    return STATUS_MESSAGE_MAP[code]
  }

  return "请求失败"
}

const showErrorToast = (message: string): void => {
  toast.error(message)
}

const normalizeResponseError = (code?: number, message?: string): Error => {
  const errorMessage = getStatusMessage(code, message)

  showErrorToast(errorMessage)

  return createRequestError(errorMessage)
}

const extractResponseData = (
  response: AxiosResponse<ApiResponse<unknown>>
): unknown => {
  const responseData = response.data

  if (!isApiResponse(responseData)) {
    const errorMessage = "接口返回格式不正确"

    showErrorToast(errorMessage)

    throw createRequestError(errorMessage)
  }

  if (responseData.code !== SUCCESS_CODE) {
    throw normalizeResponseError(responseData.code, responseData.message)
  }

  return responseData.data
}

const handleResponseError = (
  error: AxiosError<ApiResponse<unknown>>
): Promise<never> => {
  const responseData = error.response?.data
  const errorCode =
    (isApiResponse(responseData) ? responseData.code : undefined) ??
    error.response?.status
  const errorMessage = isApiResponse(responseData)
    ? responseData.message
    : undefined

  return Promise.reject(normalizeResponseError(errorCode, errorMessage))
}

const baseURL = import.meta.env.DEV ? "/api" : "http://120.26.21.10/"

const request = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
}) as RequestInstance

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    config.headers.set("Accept", "application/json")

    return config
  },
  (error: AxiosError): Promise<never> => {
    const errorMessage = "请求发送失败"

    showErrorToast(errorMessage)

    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  extractResponseData as Parameters<
    typeof request.interceptors.response.use
  >[0],
  handleResponseError
)

export default request
