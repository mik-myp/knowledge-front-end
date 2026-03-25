import type { NavigateFunction } from "react-router"

import useUser from "@/stores/useUser"
import type { TokenPairResult } from "@/types/user"

/**
 * 将登录返回的用户信息和令牌写入本地会话。
 * @param data 登录或刷新接口返回的令牌对结果。
 * @returns 数据写入完成后不返回额外内容。
 */
export const saveAuthSession = (data: TokenPairResult) => {
  useUser.getState().setUser(data.user)
  localStorage.setItem("accessToken", data.accessToken)
  localStorage.setItem("refreshToken", data.refreshToken)
}

/**
 * 清理本地保存的用户信息和认证令牌。
 * @returns 清理完成后不返回额外内容。
 */
export const clearAuthSession = () => {
  useUser.getState().setUser(null)
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}

/**
 * 保存认证信息并跳转到首页。
 * @param data 登录或刷新接口返回的令牌对结果。
 * @param navigate 路由跳转函数。
 * @returns 保存并跳转完成后不返回额外内容。
 */
export const persistAuthSession = (
  data: TokenPairResult,
  navigate: NavigateFunction
) => {
  saveAuthSession(data)
  navigate("/")
}
