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
