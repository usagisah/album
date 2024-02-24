import { execa } from "@albumjs/tools/lib/execa"
import { legalRegistryList } from "./constants.js"
import { filterLegalRegistry } from "./utils.js"

export class RegistryManager {
  async version(target: string[]) {
    if (!target || target.length === 0) {
      target = legalRegistryList
    }

    const _target = filterLegalRegistry(target)
    return Promise.allSettled(
      _target.map(async target => {
        const { stdout } = await execa(target, ["-v"])
        return { target, version: stdout }
      })
    ).then(r => r.map(v => (v.status === "fulfilled" ? v.value : false)).filter(Boolean) as { target: string; version: string }[])
  }

  async getRegistry(target: string[]) {
    if (!target || target.length === 0) {
      target = legalRegistryList
    }

    const _target = filterLegalRegistry(target)
    return Promise.allSettled(
      _target.map(async target => {
        const { stdout } = await execa(target, ["config", "get", "registry"])
        return { target, registry: stdout }
      })
    ).then(r => r.map(v => (v.status === "fulfilled" ? v.value : false)).filter(Boolean) as { target: string; registry: string }[])
  }

  async setRegistry(target: string[], source: string) {
    debugger
    await Promise.all(
      target.map(async target => {
        return execa(target, ["config", "set", "registry", source])
      })
    )
  }

  async list(target: string[]) {
    if (!target || target.length === 0) {
      target = legalRegistryList
    }

    const _target = filterLegalRegistry(target)
    return Promise.allSettled(
      _target.map(async target => {
        return {
          target,
          version: (await execa(target, ["-v"])).stdout,
          registry: (await execa(target, ["config", "get", "registry"])).stdout
        }
      })
    ).then(r => r.map(v => (v.status === "fulfilled" ? v.value : false)).filter(Boolean) as { target: string; version: string; registry: string }[])
  }
}
