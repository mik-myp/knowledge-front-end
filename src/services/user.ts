import request from "@/lib/request"
import type { TokenPairResult, TUserProfile } from "@/types/user"

export async function SayHelloWorld() {
  return await request<string>("")
}

export async function userRegister(data: {
  username: string
  email: string
  password: string
}) {
  return await request<TokenPairResult>("/users/register", {
    method: "POST",
    data,
  })
}

export async function userLogin(data: { email: string; password: string }) {
  return await request<TokenPairResult>("/users/login", {
    method: "POST",
    data,
  })
}

export async function userRefresh(data: { refreshToken: string }) {
  return await request<TokenPairResult>("/users/refresh", {
    method: "POST",
    data,
  })
}

export async function userLogout() {
  return await request<{
    success: boolean
  }>("/users/logout", {
    method: "POST",
  })
}

export async function userMe() {
  return await request<TUserProfile>("/users/me")
}
