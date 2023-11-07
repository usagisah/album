import { Env } from "../env.type.js";

export function registryEnv(env: Env) {
  for (const k of Object.getOwnPropertyNames(env)) {
    process.env[k] = env[k]
  }
  return env
}