import { INestApplication } from "@nestjs/common"
import { StatsCompilation, rspack } from "@rspack/core"
import { Func } from "../../utils/types/types.js"
import { RsConfig, createRsConfig } from "./rspack.config.js"

let first = true
export async function rsBuild(config: RsConfig, cb: Func<[Error | null, StatsCompilation | null, boolean], Promise<INestApplication | null>>) {
  const compiler = rspack(await createRsConfig(config))
  let app: INestApplication | null
  compiler.watch({}, async (error, stats) => {
    if (app) await app.close()
    const statsOptions = compiler.options?.stats
    app = await cb(error, stats ? stats.toJson(statsOptions) : null, first)
    if (app) first = false
  })
}
