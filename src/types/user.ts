/**
 * 定义用户资料的类型结构。
 */
export type TUserProfile = {
  id: string
  email: string
  username: string
  lastLoginAt?: string
}

/**
 * 定义令牌对的结果结构。
 */
export type TokenPairResult = {
  user: TUserProfile
  accessToken: string
  refreshToken: string
}

/**
 * 定义注册参数结构。
 */
export type TRegisterInput = {
  username: string
  email: string
  password: string
}

/**
 * 定义登录参数结构。
 */
export type TLoginInput = {
  email: string
  password: string
}

/**
 * 定义刷新令牌参数结构。
 */
export type TRefreshTokenInput = {
  refreshToken: string
}
