import type { TUserProfile } from "@/types/user"
import { create } from "zustand"

type UserInfoStore = {
  user: TUserProfile | null
  setUser: (user: TUserProfile | null) => void
}

const useUser = create<UserInfoStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

export default useUser
