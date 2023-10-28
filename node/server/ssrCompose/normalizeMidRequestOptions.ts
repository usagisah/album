const placeholderHost = "http://host"
export function normalizeMidRequestOptions(path: string) {
  const url = new URL(placeholderHost + path)

  let prefix = url.pathname.split("/")[1].toLowerCase()
  if (prefix === "") prefix = "home"

  let pathname = url.pathname.slice(prefix.length)
  if (pathname.length === 0) pathname = "/"

  return { pathname, prefix }
}