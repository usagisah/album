const fns: any[] = []
const signalHandle = () => {
  fns.forEach(f => f())
  process.exit(0)
}
const exitHandle = () => {
  fns.forEach(f => f())
}

process.on("exit", exitHandle)
process.on("SIGINT", signalHandle)
process.on("SIGTERM", signalHandle)
process.on("SIGQUIT", signalHandle)

export function onSystemQuit(fn: () => any) {
  fns.push(fn)
}
