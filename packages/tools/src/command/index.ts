import minimist from "minimist"

export type { ParsedArgs as NodeArgs } from "minimist"

export function resolveNodeArgs() {
  return minimist(process.argv.slice(2))
}
