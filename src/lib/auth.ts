import type { NavigateFunction } from "react-router"

import useUser from "@/stores/useUser"
import type { TokenPairResult } from "@/types/user"

export const saveAuthSession = (data: TokenPairResult) => {
  useUser.getState().setUser(data.user)
  localStorage.setItem("accessToken", data.accessToken)
  localStorage.setItem("refreshToken", data.refreshToken)
}

export const clearAuthSession = () => {
  useUser.getState().setUser(null)
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}

export const persistAuthSession = (
  data: TokenPairResult,
  navigate: NavigateFunction
) => {
  saveAuthSession(data)
  navigate("/")
}
