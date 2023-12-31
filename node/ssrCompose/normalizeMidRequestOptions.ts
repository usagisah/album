const placeholderHost = "a://a"
export function normalizeMidRequestOptions(path: string, projectMap: Map<any, any>) {
  const url = new URL(placeholderHost + path)
  let pathnames = url.pathname.split("/")

  let prefix = pathnames[1].toLowerCase()
  let pathname = ""
  if (prefix === "") {
    prefix = "home"
    pathnames = ["/", "home", ...pathnames.slice(2)]
  }
  if (projectMap.has(prefix)) {
    pathname = "/" + pathnames.slice(2).join("/")
  } else {
    prefix = "error"
    pathname = pathnames.join("/")
  }

  const originalPathname = url.pathname
  url.pathname = pathname
  return { pathname, prefix, originalPathname, url: url.toString().slice(placeholderHost.length) }
}
