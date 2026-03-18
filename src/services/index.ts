import request from "@/lib/request"

export async function SayHelloWorld() {
  return await request<string>("")
}

export async function login(data: { email: string; password: string }) {
  return await request<{
    user: {
      id: string
      email: string
      username: string
      lastLoginAt?: Date
    }
    accessToken: string
    refreshToken: string
  }>("/users/login", {
    method: "POST",
    data,
  })
}
