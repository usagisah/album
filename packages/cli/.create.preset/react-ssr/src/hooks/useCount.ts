import { useState } from "react"

export function useCount(defaultNum: number) {
  const [n, set] = useState(defaultNum ?? 0)
  return [n, () => set(n + 1)] as const
}
