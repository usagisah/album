import { Request } from "express"
import { ServerConfig } from "../context/context.type.js"
import { isStringEmpty } from "../utils/check/simple.js"
import { queryString } from "../utils/request/searchParams.js"

export function createRewriter(rewriteRules: ServerConfig["rewrite"]) {
  return function rewrite(req: Request) {
    if (rewriteRules.length === 0) return

    const { originalUrl } = req
    let search = ""
    let pathname = originalUrl
    const index = originalUrl.indexOf("?")
    if (index > -1) {
      search = originalUrl.slice(index)
      pathname = originalUrl.slice(0, index)
    }
    for (const rule of rewriteRules) {
      try {
        const res = rule(pathname, queryString.parse(search), req)
        if (!isStringEmpty(pathname)) pathname = res
      } catch {}
    }
    req.url = pathname + search
  }
}
