import { format } from "@albumjs/tools/lib/pretty-format"
import { record, string } from "@albumjs/tools/lib/zod"
import { isArray, isBlank, isRegExp } from "@albumjs/tools/node"
import { Inputs } from "../context/context.dev.type.js"
import { PluginManager } from "../plugins/plugin.dev.type.js"
import { UserConfigApp } from "../user/user.dev.type.js"
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
  if (isBlank(mainInput)) throw "app.main 客户端入口路径不合法, " + commonError + "(" + mainInput + ")"

  const mainSSRInput: string | null = result.mainSSR ?? null
  if (c.mainSSR || ssrCompose) {
    if (isBlank(mainSSRInput)) throw "app.mainSSR SSR入口路径不合法, " + commonError + "(" + mainSSRInput + ")"
  }

  const routerConfig: AppManagerRouter = { basename: "/", redirect: {} }
  if (result.router?.basename) {
    let basename = result.router.basename
    if (isBlank(basename)) {
      throw "app.router.basename 配置不合法, " + commonError + "(" + basename + ")"
    }
    if (!basename.startsWith("/")) {
      basename = "/" + basename
    }
    routerConfig.basename = basename
  }
  if (result.router?.redirect) {
    const _redirect = result.router.redirect
    if (!record(string()).safeParse(_redirect).success) {
      throw "app.router.redirect 配置不合法, " + commonError + "(" + format(_redirect) + ")"
    }
    const redirect = {}
    for (let from in _redirect) {
      let to = _redirect[from]

      if (!from.startsWith("/")) {
        from = "/" + from
      }
      if (!to.startsWith("/")) {
        to = "/" + to
      }
      redirect[from] = to
    }
    routerConfig.redirect = redirect
  }

  const moduleConfig: AppManagerModule = {
    moduleName: result.module!.name!,
    modulePath: result.module!.path!,
    ignore: [/^(\.)|(_)|(common)/]
  }
  if (!moduleConfig.modulePath) throw `找不到${c.module?.path ? "指定的" : "默认的"} app.module.path 入口`
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
