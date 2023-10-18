import minimist from "minimist"

export type NodeArgs = minimist.ParsedArgs

export function nodeArgs(): NodeArgs {
  return minimist(process.argv.slice(2))
}