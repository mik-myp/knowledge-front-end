import { create } from "zustand"
import { persist } from "zustand/middleware"
import i18n from "@/lib/i18n"
import dayjs from "dayjs"

import "dayjs/locale/zh-cn"
import "dayjs/locale/en"

export type Language = "zh-cn" | "en"

function syncLanguage(lang: Language): void {
  void i18n.changeLanguage(lang)
  dayjs.locale(lang)
}

export const useGlobal = create<{
  language: Language
  setLanguage: (lang: Language) => void
}>()(
  persist(
    (set) => ({
      language: "zh-cn",
      setLanguage: (lang: Language) => {
        set({ language: lang })
        syncLanguage(lang)
      },
    }),
    {
      name: "global-storage",
      onRehydrateStorage: () => (state) => {
        syncLanguage(state?.language ?? "zh-cn")
      },
    }
  )
)
