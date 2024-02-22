import React from "react"
import { RouteContext } from "../router/RouteContext"

export function useLoader<T>(): ["success", T]
export function useLoader<T = any>(): ["loading", null]
export function useLoader<T = any>(): ["fail", any]
export function useLoader(): any {
  const [_, flush] = React.useState(0)
  const { loader, localData } = React.useContext(RouteContext)
  const options = loader.get(localData.route.fullPath)
  if (!options) return ["success", null]
  if (options.stage !== "loading") return [options.stage, options.value]
  options.pending.push(() => {
    flush(Math.random())
  })
  return ["loading", null]
}
