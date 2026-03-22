import { create } from "zustand"

type DocumentsVersionStore = {
  version: number
  invalidate: () => void
}

const useDocumentsVersion = create<DocumentsVersionStore>((set) => ({
  version: 0,
  invalidate: () =>
    set((state) => ({
      version: state.version + 1,
    })),
}))

export default useDocumentsVersion
