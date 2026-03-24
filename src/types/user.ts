export type TUserProfile = {
  id: string
  email: string
  username: string
  lastLoginAt?: string
}

export type TokenPairResult = {
  user: TUserProfile
  accessToken: string
  refreshToken: string
}
