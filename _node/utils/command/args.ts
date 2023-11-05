import minimist from "minimist"

export type NodeArgs = minimist.ParsedArgs

export function resolveNodeArgs(): NodeArgs {
  return minimist(process.argv.slice(2))
}
