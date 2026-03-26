import request from "@/lib/request"
import type {
  TLoginInput,
  TRefreshTokenInput,
  TRegisterInput,
  TokenPairResult,
  TUserProfile,
} from "@/types/user"

/**
 * 提交用户注册请求。
 * @param data 注册表单数据，包含用户名、邮箱和密码。
 * @returns 返回注册成功后的令牌对和用户信息。
 */
export async function userRegister(data: TRegisterInput) {
  return await request<TokenPairResult>("/users/register", {
    method: "POST",
    data,
  })
}

/**
 * 提交用户登录请求。
 * @param data 登录表单数据，包含邮箱和密码。
 * @returns 返回登录成功后的令牌对和用户信息。
 */
export async function userLogin(data: TLoginInput) {
  return await request<TokenPairResult>("/users/login", {
    method: "POST",
    data,
  })
}

/**
 * 使用刷新令牌换取新的认证令牌。
 * @param data 刷新令牌请求数据。
 * @returns 返回新的访问令牌、刷新令牌和当前用户信息。
 */
export async function userRefresh(data: TRefreshTokenInput) {
  return await request<TokenPairResult>("/users/refresh", {
    method: "POST",
    data,
  })
}

/**
 * 提交退出登录请求。
 * @returns 返回退出登录是否成功的结果。
 */
export async function userLogout() {
  return await request<{
    success: boolean
  }>("/users/logout", {
    method: "POST",
  })
}

/**
 * 获取当前登录用户资料。
 * @returns 返回当前登录用户的资料信息。
 */
export async function userMe() {
  return await request<TUserProfile>("/users/me")
}
