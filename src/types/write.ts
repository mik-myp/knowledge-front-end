export type TAIWriteConfig = {
  topic: string
  articleType: "blog" | "summary" | "report" | "product" | "story" | "email"
  language: "chinese" | "english"
  tone: "professional" | "friendly" | "formal" | "persuasive"
  length: "short" | "medium" | "long"
  creativity: number
}

export type TWriteStreamChunk = {
  content: string
  progress?: string
  error?: string
  done?: boolean
}
