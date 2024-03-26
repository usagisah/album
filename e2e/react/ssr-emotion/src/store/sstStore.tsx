import { FC } from "album"
import { createContext, useContext, useRef } from "react"

export const SSRStoreId = "ssr-store"

const SSRStoreContext = createContext<any>(null as any)

export const SSRStoreProvide: FC<{
  state?: Record<any, any>
  removeSSRScript?: boolean
}> = ({ state, removeSSRScript = true, children }) => {
  const ssrState = useRef<any>()
  if (!ssrState.current) {
    if (typeof window !== "undefined") {
      const el = document.querySelector("#" + SSRStoreId) as HTMLScriptElement
      if (el) {
        ssrState.current = JSON.parse(el.textContent!)
        if (removeSSRScript) {
          el.parentElement?.removeChild(el)
        }
      }
    } else {
      ssrState.current = state
    }
  }
  return <SSRStoreContext.Provider value={ssrState.current}>{children}</SSRStoreContext.Provider>
}

export function useSSRStore<T = any>(): T {
  return useContext(SSRStoreContext) ?? {}
}
