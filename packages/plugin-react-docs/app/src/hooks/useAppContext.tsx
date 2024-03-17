import react, { ReactNode } from "react"

export interface AppContext {}
const AppContext = react.createContext<AppContext>(null as any)

export function AppProvide(props: { context: AppContext; children: ReactNode }) {
  const { context, children } = props
  const appContext = react.useRef(context)
  return <AppContext.Provider value={appContext.current}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const appContext = react.useContext(AppContext)
  return appContext
}
