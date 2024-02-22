import React from "react"
import { RouteContext } from "../router/RouteContext"

export function useRouter() {
  const { localData } = React.useContext(RouteContext)
  const { loader, ...meta } = localData.route.meta
  return { ...localData, meta }
}
