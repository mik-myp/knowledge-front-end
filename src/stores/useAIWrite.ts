import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TAIWriteConfig } from "@/types/write"

const defaultWriteConfig: TAIWriteConfig = {
  topic: "",
  articleType: "blog",
  language: "chinese",
  tone: "professional",
  length: "medium",
  creativity: 0.7,
}

export const useAIWrite = create<{
  writeConfig: TAIWriteConfig
  setWriteConfig: (config: TAIWriteConfig) => void
  resetWriteConfig: () => void
}>()(
  persist(
    (set) => ({
      writeConfig: defaultWriteConfig,
      setWriteConfig: (config: TAIWriteConfig) => {
        set({ writeConfig: config })
      },
      resetWriteConfig: () => {
        set({ writeConfig: defaultWriteConfig })
      },
    }),
    {
      name: "ai-write-config",
    }
  )
)
