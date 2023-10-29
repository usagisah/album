import { SsrComposeProjectsInput } from "../../context/AlbumContext.type.js"

const placeholderHost = "a://a"
export function normalizeMidRequestOptions(path: string, ssrComposeProjectsInput: SsrComposeProjectsInput) {
  const url = new URL(placeholderHost + path)
  const pathnames = url.pathname.split("/")

  let prefix = pathnames[1].toLowerCase()
  let pathname = ""
  if (prefix === "") prefix = "home"
  if (!ssrComposeProjectsInput.has(prefix)) {
    prefix = "error"
    pathname = pathnames.join("/")
  } else {
    pathname = "/" + pathnames.slice(2).join("/")
  }

  url.pathname = pathname
  return { pathname, prefix, url: url.toString().slice(placeholderHost.length) }
}
