import { existsSync } from "fs"
import { stat } from "fs/promises"
import { format } from "pretty-format"
import { Inputs } from "../context/context.dev.type.js"
import { PluginManager } from "../plugins/plugin.dev.type.js"
import { UserConfigApp } from "../user/user.dev.type.js"
import { isArray, isRegExp, isStringEmpty } from "../utils/check/simple.js"
import { AppManager, AppManagerModule, AppManagerRouter, AppManagerSSRRender } from "./app.dev.type.js"

type AppManagerConfig = {
  appId: string
  inputs: Inputs
  pluginManager: PluginManager
  ssrCompose: boolean
  userConfigApp?: UserConfigApp | UserConfigApp[]
}

export async function createAppManager(config: AppManagerConfig) {
  const { appId, inputs, pluginManager, userConfigApp, ssrCompose } = config
  const appConfigs = isArray(userConfigApp) ? (userConfigApp.length > 0 ? userConfigApp : [{}]) : [userConfigApp ?? {}]
  const ids = new Set<any>([...appConfigs.map(v => v.id)])
  if (ids.size !== appConfigs.length) throw "config.app 每项必须携带唯一id，这将用于启动匹配"

  const c = appConfigs.length === 1 ? appConfigs[0] : appConfigs.find(v => v.id === appId)
  if (!c) throw "config.app 应用列表中找不到指定的或默认的服务启动项，请使用app[].id 存在的 id 启动"

  const { result } = await pluginManager.execute("findEntries", {
    appId,
    inputs,
    result: {
      main: c.main,
      mainSSR: c.mainSSR,
      router: c.router,
      module: c.module,
      appConfig: c
    }
  })
  const commonError = "请正确使用或添加, 相关的插件. 失败路径:"
  const mainInput: string = result.main!
  if (isStringEmpty(mainInput)) throw "app.main 客户端入口路径不合法, " + commonError + "(" + mainInput + ")"
  if (!existsSync(mainInput)) throw "app.main 找不到与客户端入口路径匹配的文件, " + commonError + "(" + mainInput + ")"

  const mainSSRInput: string | null = result.mainSSR ?? null
  if (c.mainSSR || ssrCompose) {
    if (isStringEmpty(mainSSRInput)) throw "app.mainSSR SSR入口路径不合法, " + commonError + "(" + mainSSRInput + ")"
    if (!existsSync(mainSSRInput as string)) throw "app.mainSSR 找不到与SSR入口路径匹配的文件, " + commonError + "(" + mainSSRInput + ")"
  }

  const routerConfig: AppManagerRouter = (result.router as any) ?? { basename: "/" }
  if (isStringEmpty(routerConfig.basename)) throw "app.router.basename 配置不合法, " + commonError + "(" + format(routerConfig) + ")"
  if (!routerConfig.basename) routerConfig.basename = "/"
  else if (!routerConfig.basename.startsWith("/")) routerConfig.basename = "/" + routerConfig.basename

  const moduleConfig: AppManagerModule = {
    moduleName: result.module!.name!,
    modulePath: result.module!.path!,
    ignore: [/^(\.)|(_)|(common)/]
  }
  if (!moduleConfig.modulePath) throw `找不到${c.module?.path ? "指定的" : "默认的"} app.module.path 入口`
  if (!existsSync(moduleConfig.modulePath)) throw "找不到与module.path入口匹配的文件, " + commonError + moduleConfig.modulePath
  if (!(await stat(moduleConfig.modulePath)).isDirectory()) throw "app.module.path 指向的不是一个文件夹"
  if (isArray(result.module!.ignore)) {
    const ignores = result.module!.ignore.map(v => (isRegExp(v) ? v : new RegExp(`^${v}`)))
    moduleConfig.ignore.push(...ignores)
  }

  const ssrRender: AppManagerSSRRender = { sendMode: c.ssrRender?.sendMode ?? "pipe" }
  const manager: AppManager = {
    mainInput,
    mainSSRInput,
    ssrRender,
    router: routerConfig,
    module: moduleConfig,
    realClientInput: "",
    realSSRInput: "",
    specialModules: []
  }
  return manager as AppManager
}
