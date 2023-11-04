import minimist from "minimist"

export type NodeArgs = minimist.ParsedArgs

export function args(): NodeArgs {
  return minimist(process.argv.slice(2))
}
