import { create } from "zustand"

/**
 * 描述文档版本状态仓库的结构。
 */
type DocumentsVersionStore = {
  version: number
  invalidate: () => void
}

/**
 * 通过版本号递增触发文档相关数据重新获取的 Zustand store。
 */
const useDocumentsVersion = create<DocumentsVersionStore>((set) => ({
  version: 0,
  invalidate: () =>
    set((state) => ({
      version: state.version + 1,
    })),
}))

export default useDocumentsVersion
