import { isStringEmpty } from "../utils/check/simple.js"
import { queryString } from "../utils/request/searchParams.js"
import { Func } from "../utils/types/types.js"

export function createPathRewriter(rewrites: Func[]) {
  if (rewrites.length === 0) return (url: string) => url
  return function rewriter(url: string) {
    let pathname = url
    let search = ""
    const index = url.indexOf("?")
    if (index > -1) {
      search = url.slice(index)
      pathname = url.slice(0, index)
    }
    for (const fn of rewrites) {
      try {
        const res = fn(pathname, queryString.parse(search))
        if (!isStringEmpty(pathname)) pathname = res
      } catch {}
    }
    return pathname + search
  }
}
