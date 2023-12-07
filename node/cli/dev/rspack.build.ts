import { INestApplication } from "@nestjs/common"
import { Stats, StatsCompilation, rspack } from "@rspack/core"
import { Func } from "../../utils/types/types.js"
import { RsConfig, createRsConfig } from "./rspack.config.js"

let first = true
export async function rsBuild(type: "build" | "watch", config: RsConfig, cb: Func<[Error | null, StatsCompilation | null, boolean], Promise<INestApplication | null>>) {
  const compiler = rspack(await createRsConfig(config))
  let app: INestApplication | null
  const handler = async (error: Error | null, stats?: Stats) => {
    console.log( type, "handle" )
    if (app) await app.close()
    const statsOptions = compiler.options?.stats
    app = await cb(error, stats ? stats.toJson(statsOptions) : null, first)
    if (app) first = false
  }
  type === "build" ? compiler.run(handler) : compiler.watch({}, handler)
}
