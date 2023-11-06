import { existsSync } from "fs"
import { format } from "pretty-format"
import { z } from "zod"
import { ILogger } from "../../modules/logger/logger.type.js"
import { isStringEmpty } from "../../utils/check/simple.js"
import { PluginConfig } from "../context.type.js"
import { DevInputs } from "../inputs/inputs.type.js"
import { callPluginWithCatch } from "../plugins/callPluginWithCatch.js"
import { UserConfigApp } from "../userConfig/userConfig.type.js"
import { ClientConfig, ClientConfigModule, ClientConfigRouter } from "./clientConfig.type.js"
import { stat } from "fs/promises"

type ClientConfigParams = {
  appId: string
  inputs: DevInputs
  pluginConfig: PluginConfig
  logger: ILogger
  conf?: UserConfigApp[]
}

export async function createClientConfig({ appId, inputs, pluginConfig, conf, logger }: ClientConfigParams) {
  if (!conf) conf = [{}]

  const ids = new Set<any>([...conf.map(v => v.id)])
  if (ids.size !== conf.length) throw "config.app 每项必须携带唯一id，这将用于启动匹配"

  const c = conf.length === 1 ? conf[0] : conf.find(v => v.id === appId)
  if (!c) throw "config.app 应用列表中找不到指定的或默认的服务启动项，请使用app[].id 存在的 id 启动"

  const { events, plugins } = pluginConfig
  const { result } = await callPluginWithCatch(
    "findEntries",
    plugins,
    {
      events,
      messages: new Map(),
      appId,
      inputs,
      result: {
        main: c.main,
        mainSSR: c.mainSSR,
        router: c.router,
        module: c.module,
        appConfig: c
      }
    },
    logger
  )

  const commonError = "请正确使用或添加, 相关的插件: "

  const mainInput: string = result.main!
  if (isStringEmpty(mainInput)) throw "app.main 客户端入口路径不合法, " + commonError + "(" + mainInput + ")"
  if (!existsSync(mainInput)) throw "app.main 找不到与客户端入口路径匹配的文件, " + commonError + "(" + mainInput + ")"

  const mainSSRInput: string | null = result.mainSSR ?? null
  if (c.mainSSR) {
    if (isStringEmpty(mainSSRInput)) throw "app.mainSSR SSR入口路径不合法, " + commonError + "(" + mainSSRInput + ")"
    if (!existsSync(mainSSRInput as string)) throw "app.mainSSR 找不到与SSR入口路径匹配的文件, " + commonError + "(" + mainSSRInput + ")"
  }

  const routerConfig: ClientConfigRouter = (result.router as any) ?? { basename: "/" }
  if (!z.object({ basename: z.string().min(1) }).safeParse(routerConfig).success) throw "app.router.basename 配置不合法, " + commonError + "(" + format(routerConfig) + ")"
  if (!routerConfig.basename) routerConfig.basename = "/"
  else if (!routerConfig.basename.startsWith("/")) routerConfig.basename = "/" + routerConfig.basename

  const _moduleConfig = result.module!
  let moduleConfig: ClientConfigModule | null = null
  if (c.module?.path) {
    if (!z.object({ path: z.string().min(1), name: z.string().min(1).optional() })) throw "app.module 配置不合法, " + commonError + "(" + format(_moduleConfig) + ")" 
    if (!existsSync(_moduleConfig.path!)) throw "app.module.path 找不到与module.path入口匹配的文件, " + commonError + _moduleConfig.path
    if (!(await stat(_moduleConfig.path!)).isDirectory()) throw "app.module.path 指向的不是一个文件夹"
    moduleConfig = { moduleName: _moduleConfig.name ?? "modules", modulePath: _moduleConfig.path! }
  }

  const clientConfig: ClientConfig = {
    mainInput,
    mainSSRInput,
    router: routerConfig,
    module: moduleConfig
  }
  return clientConfig
}