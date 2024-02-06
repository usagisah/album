import EventEmitter from "events"
import { ILogger } from "../logger/logger.type.js"
import { AlbumUserPlugin } from "./plugin.dev.type.js"

export type PluginManagerConfig = {
  userPlugin?: AlbumUserPlugin[]
  logger: ILogger
}

type Keys = keyof Omit<AlbumUserPlugin, "name">
type GetPluginParams<T> = T extends (params: infer P) => any ? P : never
type Props<T extends Keys> = Omit<GetPluginParams<Required<AlbumUserPlugin>[T]>, "events" | "messages">
export function createPluginManager(config: PluginManagerConfig) {
  const { userPlugin = [], logger } = config
  const commonEvents = new EventEmitter()

  async function execute<T extends Keys>(key: T, props: Props<T>) {
    const messages = new Map()
    let r: any = props
    for (const pg of userPlugin) {
      try {
        const fn: any = pg[key]
        if (fn) {
          const params = { ...props, events: commonEvents, messages }
          await Promise.resolve(fn(params)).then(() => {
            const { events, messages, ..._props } = params
            r = _props
          })
        }
      } catch (e) {
        logger.error(`插件(${pg.name}-${key})发生错误，错误信息:`, e, "album-plugin")
      }
    }
    return r as Props<T>
  }

  return { execute }
}
