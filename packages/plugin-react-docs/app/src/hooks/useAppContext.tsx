import { PageContext } from "album.docs"
import react, { ReactNode } from "react"

const AppContext = react.createContext<PageContext>(null as any)

export function AppProvide(props: { context: PageContext; children: ReactNode }) {
  const { context, children } = props
  const appContext = react.useRef(context)
  return <AppContext.Provider value={appContext.current}>{children}</AppContext.Provider>
}

export function usePage() {
  const appContext = react.useContext(AppContext)
  return appContext
}
