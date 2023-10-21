import { EnvValue } from "../AlbumContext.type.js"

import { resolve } from "path"
import { build as esbuild } from "esbuild"
import { isFunction, isPlainObject, isString } from "../../utils/utils.js"

export function createEmptyEnvValue() {
  return { common: {}, development: {}, production: {} }
}

export async function transformEnvValue(env: unknown): Promise<EnvValue> {
  const emptyValue = createEmptyEnvValue()
  if (!env) return emptyValue

  if (Array.isArray(env)) {
    const common = {}
    const development = {}
    const production = {}
    for (const item of env) {
      const res = await transformEnvValue(item)
      Object.assign(common, res.common)
      Object.assign(development, res.development)
      Object.assign(production, res.production)
    }

    return { common, development, production }
  }

  if (isString(env)) {
    const path = resolve(env)
    const output = path + ".mjs"
    await esbuild({
      entryPoints: [path],
      format: "esm",
      platform: "node",
      outfile: output
    })
    let envValue = emptyValue
    try {
      let exports = (await import(output)).default
      envValue = isFunction(exports) ? exports() : exports
    } catch {
      envValue = emptyValue
    }
  }

  if (isPlainObject(env)) {
    return {
      common: toStringObject(env.common),
      development: toStringObject(env.development),
      production: toStringObject(env.production)
    }
  }

  return emptyValue
}

function toStringObject(obj: Record<string, unknown>): Record<string, string> {
  const res: Record<string, string> = {}

  if (!isPlainObject(obj)) {
    return res
  }

  for (const key of Object.getOwnPropertyNames(obj)) {
    res[key] = obj[key] + ""
  }
  return res
}
