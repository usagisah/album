import { gray, green, magenta, red, yellow } from "@albumjs/tools/lib/colorette"
import { format as prettyFormat } from "@albumjs/tools/lib/pretty-format"

const colors = { log: green, info: green, warn: yellow, error: red, debug: magenta }
export function getColor(type: keyof typeof colors | (string & {})) {
  return colors[type] ?? gray
}

export function formatConsoleMessage(level: string, context: string | null, messages: string[]) {
  const c = getColor(level)
  const m = messages.map(m => (typeof m === "string" ? m : prettyFormat(m, { highlight: true }))).join("")
  return `${red("[" + level + "]")} ${context ? gray("[" + context + "]") : ""} -> ${c(m)}\n`
}
