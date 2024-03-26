import { create } from "zustand"

interface BearState {
  bears: number
  increaseBears: (by?: number) => void
}

export const useBearStore = create<BearState>()(set => ({
  bears: 0,
  increaseBears: by => set(state => ({ bears: state.bears + (by ?? 1) }))
}))

export * from "./sstStore"
