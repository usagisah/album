import { ServerMode } from "../../../cli/cli.type.js"
import { DevInputs } from "../../inputs/inputs.type.js"
import { UserConfigEnv } from "../../userConfig/userConfig.type.js"
import { Env } from "../env.type.js"
import { transformEnvValue } from "./transform.js"

export async function registryEnv(serverMode: ServerMode, inputs: DevInputs, env?: UserConfigEnv[]) {
  const { common, development, production } = await transformEnvValue(inputs.cwd, env)
  const record: Env = { ...common, ...(serverMode === "build" ? production : development) }
  for (const k of Object.getOwnPropertyNames(record)) {
    process.env[k] = record[k]
  }
  return record
}
