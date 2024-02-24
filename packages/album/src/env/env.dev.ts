import { Inputs } from "../context/context.dev.type.js"
import { ServerMode } from "../service/service.type.js"
import { UserConfigEnv } from "../user/user.dev.type.js"
import { createEmptyEnvValue } from "./createEmptyEnvValue.js"
import { Env, EnvValue } from "./env.type.js"
import { transformEnvValue } from "./transform.dev.js"

export async function registryEnv(serverMode: ServerMode, inputs: Inputs, env?: UserConfigEnv[]) {
  const { cwd } = inputs
  let envValue: EnvValue
  if (env) {
    const common = {}
    const development = {}
    const production = {}
    for (const item of env) {
      const res = await transformEnvValue(cwd, item)
      Object.assign(common, res.common)
      Object.assign(development, res.development)
      Object.assign(production, res.production)
    }
    envValue = { common, development, production }
  } else {
    envValue = createEmptyEnvValue()
  }

  const record: Env = { ...envValue.common, ...(serverMode === "build" ? envValue.production : envValue.development) }
  Object.assign(process.env, record)
  if (!record.mode) record.mode = serverMode === "build" ? "production" : "development"
  return record
}
