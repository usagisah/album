import React from "react"
import { SSRContext } from "../ssr/SSRContext"

let data: any = null

export function useServerRouteData() {
  if (import.meta.env.SSR) return { ...React.useContext(SSRContext).context.serverRouteData }
  if (data) return data

  const elem = document.getElementById("server-router-data")
  if (!elem) {
    return (data = {})
  }

  try {
    data = JSON.parse(elem.textContent!)
  } catch {
    data = {}
  }
  return data
}
