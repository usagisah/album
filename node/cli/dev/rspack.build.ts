import { Stats, StatsCompilation, rspack } from "@rspack/core"
import { Func } from "../../utils/types/types.js"
import { RsBuildConfig, createRsConfig } from "./rspack.config.js"

export async function rsBuild(type: "build" | "watch", config: RsBuildConfig, handler: Func<[Error | null, StatsCompilation | null]>) {
  const compiler = rspack(await createRsConfig(config))
  const _handler = async (error: Error | null, stats?: Stats) => {
    const statsOptions = compiler.options?.stats
    await handler(error, stats ? stats.toJson(statsOptions) : null)
  }
  type === "build" ? compiler.run(_handler) : compiler.watch({}, _handler)
}
