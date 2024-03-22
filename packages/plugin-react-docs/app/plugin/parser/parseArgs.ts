export function parseArgs(code: string) {
  const s = code.indexOf("{")
  const e = s === -1 ? -1 : code.lastIndexOf("}")
  if (s === -1 || e === -1) {
    return { text: code, args: [] }
  }
  const args = code
    .slice(s + 1, e)
    .split(/\s*,\s*/g)
    .filter(v => v.length > 0)
  const text = code.slice(0, s).trimEnd()
  return { text, args }
}
