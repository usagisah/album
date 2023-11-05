import { UserConfigApp } from "../userConfig/userConfig.type.js"
// import { ClientConfig } from "./clientConfig.type.js"
import { existsSync } from "fs"
import { z } from "zod"
import { ILogger } from "../../modules/logger/logger.type.js"
import { PluginConfig } from "../context.type.js"
import { DevInputs } from "../inputs/inputs.type.js"
import { callPluginWithCatch } from "../plugins/callPluginWithCatch.js"
import { ClientConfig, ClientConfigModule, ClientConfigRouter } from "./clientConfig.type.js"

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
  const mainRes = z.string().min(1).safeParse(mainInput)
  if (!mainRes.success) throw "app.main 客户端入口路径不合法, " + commonError + mainInput
  if (!existsSync(mainInput)) throw "app.main 找不到与客户端入口路径匹配的文件, " + commonError + mainInput

  const mainSSRInput: string | null = result.mainSSR ?? null
  if (c.mainSSR) {
    const mainSSRRes = z.string().min(1).safeParse(mainSSRInput)
    if (!mainSSRRes.success) throw "app.mainSSR SSR入口路径不合法, " + commonError + mainSSRInput
    if (!existsSync(mainSSRInput as string)) throw "app.mainSSR 找不到与SSR入口路径匹配的文件, " + commonError + mainSSRInput
  }

  const routerConfig: ClientConfigRouter = (result.router as any) ?? { basename: "/" }
  if (!z.object({ basename: z.string() }).safeParse(routerConfig).success) throw "app.router.basename 配置不合法, " + commonError + routerConfig
  if (!routerConfig.basename) routerConfig.basename = "/"
  else if (!routerConfig.basename.startsWith("/")) routerConfig.basename = "/" + routerConfig.basename

  const _moduleConfig = result.module!
  let moduleConfig: ClientConfigModule | null = null
  if (c.module?.path) {
    if (!z.object({ path: z.string(), name: z.string().optional() })) throw "app.module 配置不合法, " + commonError + _moduleConfig
    if (!existsSync(_moduleConfig.path!)) throw "app.module.path 找不到与module.path入口匹配的文件, " + commonError + _moduleConfig.path
    moduleConfig = { moduleName: _moduleConfig.name ? _moduleConfig.name.toString() : null, modulePath: _moduleConfig.path! }
  }

  const clientConfig: ClientConfig = {
    mainInput,
    mainSSRInput,
    router: routerConfig,
    module: moduleConfig
  }
  return clientConfig
}
