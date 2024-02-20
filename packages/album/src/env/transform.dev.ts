import { build as esbuild } from "@albumjs/tools/lib/esbuild"
import { isFunction, isPlainObject, isString, resolveFilePath } from "@albumjs/tools/node"
import { rm } from "fs/promises"
import { createEmptyEnvValue } from "./createEmptyEnvValue.js"
import { EnvValue } from "./env.type.js"

export async function transformEnvValue(cwd: string, env: unknown): Promise<EnvValue> {
  if (isString(env)) {
    const path = await resolveFilePath({ root: cwd, name: env, exts: ["ts", "tsx"] })
    const output = path + ".mjs"
    try {
      if (!path) throw ""
      await esbuild({ entryPoints: [path], format: "esm", platform: "node", outfile: output })
      const exports = (await import(output)).default
      env = isFunction(exports) ? await exports() : exports
    } catch {
    } finally {
      if (path) await rm(output, { force: true, recursive: true })
    }
  }

  return isPlainObject(env)
    ? {
        common: toStringObject(env.common),
        development: toStringObject(env.development),
        production: toStringObject(env.production)
      }
    : createEmptyEnvValue()
}

function toStringObject(obj: Record<string, unknown>): Record<string, string> {
  const res: Record<string, string> = {}
  if (!isPlainObject(obj)) return res
  for (const key of Object.getOwnPropertyNames(obj)) res[key] = obj[key] + ""
  return res
}
