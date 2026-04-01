import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TAIWriteConfig = {
  topic: string
  articleType: "blog" | "summary" | "report" | "product" | "story" | "email"
  language: "chinese" | "english"
  tone: "professional" | "friendly" | "formal" | "persuasive"
  length: "short" | "medium" | "long"
  creativity: number
}

const defaultWriteConfig: TAIWriteConfig = {
  topic: "",
  articleType: "blog",
  language: "chinese",
  tone: "professional",
  length: "medium",
  creativity: 50,
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
