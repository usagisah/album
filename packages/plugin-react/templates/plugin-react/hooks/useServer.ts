import React from "react"
import { SSRContext } from "../ssr/SSRContext"

const map = new Map<string, any>()

export function useServer(p1: any, p2?: any) {
  if (import.meta.env.SSR) {
    const ctx = React.useContext(SSRContext)
    const { serverDynamicData, logger } = ctx

    try {
      if (!p2) {
        return p1(ctx)
      }

      if (Reflect.has(serverDynamicData, p1)) {
        return serverDynamicData[p1]
      }
    } catch (e: any) {
      logger.error(e, "useServer")
    }

    throw new Promise(async resolve => {
      try {
        serverDynamicData[p1] = await p2(ctx)
      } catch (e: any) {
        logger.error(e, "useServer")
      } finally {
        resolve(null)
      }
    })
  }

  if (p1) {
    if (map.has(p1)) return map.get(p1)

    const elem = document.getElementById("server-data-" + p1)
    if (!elem) {
      map.set(p1, null)
      return null
    }

    let data: any
    try {
      data = JSON.parse(elem.textContent!)
    } catch {
      data = {}
    }
    map.set(p1, data)
    return data
  }
}
