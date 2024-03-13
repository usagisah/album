import React from "react"
import { RouteContext } from "../router/RouteContext"

export function useRouter() {
  const { routerLocation } = React.useContext(RouteContext)
  const { loader, ...meta } = routerLocation.route.meta
  return { ...routerLocation, meta }
}
