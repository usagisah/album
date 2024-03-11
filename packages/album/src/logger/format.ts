import boxen from "@albumjs/tools/lib/boxen"
import { gray, green, greenBright, magenta, red, yellow } from "@albumjs/tools/lib/colorette"
import { format as prettyFormat } from "@albumjs/tools/lib/pretty-format"
import { AlbumContext as DevContext } from "../context/context.dev.type.js"
import { AlbumContext as StartContext } from "../context/context.start.type.js"

const colors = { log: green, info: green, warn: yellow, error: red, debug: magenta }
export function getColor(type: keyof typeof colors | (string & {})) {
  return colors[type] ?? gray
}

export function formatConsoleMessage(level: string, context: string | null, messages: string[]) {
  const c = getColor(level)
  const m = messages.map(m => (typeof m === "string" ? m : prettyFormat(m, { highlight: true }))).join("")
  return `${red("[" + level + "]")} ${context ? gray("[" + context + "]") : ""} -> ${c(m)}\n`
}

export function formatSetupInfo(id: string, ctx: DevContext | StartContext, postInfo: [string, any][] = []) {
  const { serverMode, ssr, ssrCompose, serverManager, env } = ctx
  const { port } = serverManager

  let info = ""
  const appendInfo = (k: string, v: any) => {
    info += `${k.padStart(12, " ")}: ${greenBright(v)}\n`
  }

  appendInfo("mode", serverMode)
  appendInfo("env", env.mode)
  if (id.length > 0 && id !== "default") appendInfo("app", id)
  if (ssr) appendInfo("ssr", ssr)
  if (ssrCompose) appendInfo("ssrCompose", ssrCompose)
  postInfo.forEach(item => appendInfo(item[0], item[1]))
  if (serverMode !== "build") appendInfo("listen", `http://localhost:${port}`)

  return boxen(info.trimEnd(), {
    title: "album@0.1.0",
    titleAlignment: "center",
    borderStyle: "double",
    padding: 0.5,
    dimBorder: true
  })
}
