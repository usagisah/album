import { gray, green, magenta, red, yellow } from "@albumjs/tools/lib/colorette"
import day from "@albumjs/tools/lib/dayjs"
import { format as prettyFormat } from "@albumjs/tools/lib/pretty-format"

const colors = { log: green, info: green, warn: yellow, error: red, debug: magenta }
export function getColor(type: keyof typeof colors | (string & {})) {
  return colors[type] ?? gray
}

export function formatConsoleMessage(level: string, context: string | null, messages: string[]) {
  const c = getColor(level)
  const t = day().format("YYYY-MM-DD HH:mm:ss")
  const m = messages.map(m => (typeof m === "string" ? m : prettyFormat(m, { highlight: true }))).join("")
  return `${c("[" + level + "]")} ${red(t)} ${context ? gray("[" + context + "]") : ""} -> ${c(m)}\n`
}
