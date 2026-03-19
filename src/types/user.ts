export type TUserProfile = {
  id: string
  email: string
  username: string
  avatar?: string
  lastLoginAt?: Date
}

export type TokenPairResult = {
  user: TUserProfile
  accessToken: string
  refreshToken: string
}
