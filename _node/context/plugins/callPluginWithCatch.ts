import { ILogger } from "../../modules/logger/logger.type.js"
import { AlbumUserPlugin } from "../context.type.js"

type Keys = keyof Omit<AlbumUserPlugin, "name">
type GetPluginParams<T> = T extends (params: infer P) => any ? P : never
type Props<T extends Keys> = GetPluginParams<Required<AlbumUserPlugin>[T]>
export async function callPluginWithCatch<T extends Keys>(key: T, plugins: AlbumUserPlugin[], props: Props<T>, logger: ILogger) {
  for (const pg of plugins) {
    try {
      const fn: any = pg[key]
      if (fn) await fn(props)
    } catch (e) {
      logger.error(`插件(${pg.name}-${key})发生错误，错误信息:`, e, "album-plugin")
    }
  }
  return props
}
