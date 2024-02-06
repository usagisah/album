import { Func } from "@albumjs/tools/node"
import { Stats, StatsCompilation, rspack } from "@rspack/core"
import { RsBuildConfig, createRsConfig } from "./rspack.config.js"

export async function rsBuild(type: "build" | "watch", config: RsBuildConfig, handler?: Func<[Error | null, StatsCompilation | null]>) {
  return new Promise<Error | null>(async resolve => {
    const compiler = rspack(await createRsConfig(config))
    const _handler = async (error: Error | null, stats?: Stats) => {
      const statsOptions = compiler.options?.stats
      if (handler) await handler(error, stats ? stats.toJson(statsOptions) : null)
      resolve(error)
    }
    type === "build" ? compiler.run(_handler) : compiler.watch({}, _handler)
  })
}
