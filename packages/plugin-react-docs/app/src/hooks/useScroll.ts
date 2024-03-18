import { useEffect } from "react"

export function useScroll(fn: (e: Event) => any) {
  useEffect(() => {
    window.addEventListener("scroll", fn)
    return () => {
      window.removeEventListener("scroll", fn)
    }
  })
}
