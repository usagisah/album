import { mergeConfig as viteMergeConfig } from "vite"
import { isArray, isPlainObject, isUndefined } from "../utils/check/simple.js"
import { checkUserConfig } from "./checkUserConfig.js"
import { AlbumUserConfig } from "./user.dev.type.js"

export function mergeConfig(conf1: AlbumUserConfig, conf2: AlbumUserConfig, check = true) {
  if (check) {
    checkUserConfig(conf1)
    checkUserConfig(conf2)
  }
  return mergeConfigRecursively(conf1, conf2)
}

export function mergeConfigRecursively(conf1: AlbumUserConfig, conf2: AlbumUserConfig) {
  const merged = { ...conf1 }
  for (const key of Object.getOwnPropertyNames(conf2)) {
    const mValue = merged[key]
    const value = conf2[key]

    if (isUndefined(mValue) || key === "logger") {
      merged[key] = value
      continue
    }

    if (key === "vite") {
      merged.vite = viteMergeConfig(mValue, value)
      continue
    }

    if (key === "env") {
      merged.env = [...arraify(value), ...arraify(value)]
      continue
    }

    if (isArray(value)) {
      merged[key] = [...arraify(value), ...arraify(value)]
      continue
    }

    if (isPlainObject(value)) {
      merged[key] = mergeConfigRecursively(mValue, value)
      continue
    }

    merged[key] = value
  }
  return merged
}

function arraify(value: unknown) {
  return isArray(value) ? value : [value]
}
