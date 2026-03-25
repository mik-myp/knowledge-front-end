import type { TUserProfile } from "@/types/user"
import { create } from "zustand"

/**
 * 描述用户信息状态仓库的结构。
 */
type UserInfoStore = {
  user: TUserProfile | null
  setUser: (user: TUserProfile | null) => void
}

/**
 * 保存当前登录用户信息的 Zustand store。
 */
const useUser = create<UserInfoStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

export default useUser
