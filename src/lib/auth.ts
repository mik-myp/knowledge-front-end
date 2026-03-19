import type { NavigateFunction } from "react-router"
import * as z from "zod"

import useUser from "@/stores/useUser"
import type { TokenPairResult } from "@/types/user"

export const usernameSchema = z
  .string()
  .min(2, "用户名至少 2 个字符")
  .max(30, "用户名长度不能超过 30 个字符")

export const emailSchema = z
  .email("请输入正确的邮箱地址")
  .max(100, "邮箱长度不能超过 100 个字符")

export const passwordSchema = z
  .string()
  .min(8, "密码至少 8 个字符")
  .max(32, "密码长度不能超过 32 个字符")

export const persistAuthSession = (
  data: TokenPairResult,
  navigate: NavigateFunction
) => {
  useUser.getState().setUser(data.user)
  localStorage.setItem("accessToken", data.accessToken)
  localStorage.setItem("refreshToken", data.refreshToken)
  navigate("/")
}
