import { build as esbuild } from "esbuild"
import { resolve } from "path"
import { isArray, isFunction, isPlainObject, isString } from "../../../utils/check/simple.js"
import { createEmptyEnvValue } from "../createEmptyEnvValue.js"
import { EnvValue } from "../env.type.js"

export async function transformEnvValue(cwd: string, env: unknown): Promise<EnvValue> {
  const emptyValue = createEmptyEnvValue()
  if (!env) return emptyValue

  if (isArray(env)) {
    const common = {}
    const development = {}
    const production = {}
    for (const item of env) {
      const res = await transformEnvValue(cwd, item)
      Object.assign(common, res.common)
      Object.assign(development, res.development)
      Object.assign(production, res.production)
    }
    return { common, development, production }
  }

  if (isString(env)) {
    const path = resolve(cwd, env)
    const output = path + ".mjs"
    await esbuild({
      entryPoints: [path],
      format: "esm",
      platform: "node",
      outfile: output
    })
    env = emptyValue
    try {
      let exports = (await import(output)).default
      env = isFunction(exports) ? await exports() : exports
    } catch {}
  }

  if (isPlainObject(env)) {
    return {
      common: toStringObject(env.common),
      development: toStringObject(env.development),
      production: toStringObject(env.production)
    }
  } else {
    env = createEmptyEnvValue()
  }

  return emptyValue
}

function toStringObject(obj: Record<string, unknown>): Record<string, string> {
  const res: Record<string, string> = {}
  if (!isPlainObject(obj)) return res
  for (const key of Object.getOwnPropertyNames(obj)) {
    res[key] = obj[key] + ""
  }
  return res
}
