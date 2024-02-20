const placeholderHost = "a://a"
export function normalizeMidRequestOptions(path: string, projectMap: Map<any, any>) {
  const url = new URL(placeholderHost + path)
  const originalPathname = url.pathname

  let pathname = url.pathname.slice(1)
  let [_prefix, ..._pathnames] = pathname.split("/")
  _prefix = _prefix.toLowerCase()

  if (projectMap.has(_prefix)) {
    pathname = "/" + _pathnames.join("/")
  } else if (_prefix === "home" && projectMap.has("home")) {
    pathname = "/" + _pathnames.join("/")
  } else if (_prefix === "" && projectMap.has("home")) {
    _prefix = "home"
    pathname = originalPathname
  } else {
    _prefix = "error"
    pathname = originalPathname
  }

  url.pathname = pathname
  return {
    pathname,
    prefix: _prefix,
    url: url.toString().slice(placeholderHost.length),
    originalPathname,
    originalUrl: path
  }
}
