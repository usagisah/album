import react, { ReactNode } from "react"

const AppContext = react.createContext<any>(null as any)

export function AppProvide(props: { context: any; children: ReactNode }) {
  const { context, children } = props
  const appContext = react.useRef(context)
  return <AppContext.Provider value={appContext.current}>{children}</AppContext.Provider>
}

export function usePage() {
  const appContext = react.useContext(AppContext)
  return appContext
}
