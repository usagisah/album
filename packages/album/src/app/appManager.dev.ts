import { format } from "@albumjs/tools/lib/pretty-format"
import { record, string } from "@albumjs/tools/lib/zod"
import { isArray, isBlank, isRegExp, resolveDirPath } from "@albumjs/tools/node"
import { resolve } from "path"
import { Inputs } from "../context/context.dev.type.js"
import { ILogger } from "../logger/logger.type.js"
import { PluginManager } from "../plugins/plugin.dev.type.js"
import { UserConfigApp } from "../user/user.dev.type.js"
import { AppManager, AppManagerModule, AppManagerRouter, AppManagerSSRRender } from "./app.dev.type.js"

type AppManagerConfig = {
  appId: string
  inputs: Inputs
  pluginManager: PluginManager
  ssrCompose: boolean
  userConfigApp?: UserConfigApp | UserConfigApp[]
  logger: ILogger
}

export async function createAppManager(config: AppManagerConfig) {
  const { appId, inputs, pluginManager, userConfigApp, ssrCompose, logger } = config
  const appConfigs = isArray(userConfigApp) ? (userConfigApp.length > 0 ? userConfigApp : [{}]) : [userConfigApp ?? {}]
  const ids = new Set<any>([...appConfigs.map(v => v.id)])
  if (ids.size !== appConfigs.length) throw "config.app 每项必须携带唯一id，这将用于启动匹配"

  const c = appConfigs.length === 1 ? appConfigs[0] : appConfigs.find(v => v.id === appId)
  if (!c) throw "config.app 应用列表中找不到指定的或默认的服务启动项，请使用app[].id 存在的 id 启动"

  const commonError = "请正确使用或添加, 相关的插件. 失败路径:"
  let {
    main: mainInput,
    mainSSR: mainSSRInput,
    router: _routerConfig,
    modules: _moduleConfig = []
  } = await pluginManager.execute("findEntries", {
    logger,
    appId,
    inputs,
    main: c.main,
    mainSSR: c.mainSSR,
    router: c.router,
    modules: isArray(c.module) ? c.module : c.module ? [c.module] : [],
    appConfig: c
  })

  const routerConfig: AppManagerRouter = { basename: "/", redirect: {} }
  if (_routerConfig?.basename) {
    let basename = _routerConfig.basename
    if (isBlank(basename)) {
      throw "app.router.basename 配置不合法, " + commonError + "(" + basename + ")"
    }
    if (!basename.startsWith("/")) {
      basename = "/" + basename
    }
    routerConfig.basename = basename
  }
  if (_routerConfig?.redirect) {
    const _redirect = _routerConfig.redirect
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

  if (_moduleConfig.length === 0) {
    _moduleConfig.push({})
  }
  const modulesConfig: AppManagerModule[] = await Promise.all(
    _moduleConfig.map(async (m, i) => {
      const { name, path, pageFilter, routerFilter, actionFilter, fileExtensions, ignore, iteration } = m
      const moduleName = name ?? "modules"

      let modulePath = path
      if (path && !path.startsWith("/")) {
        modulePath = resolve(inputs.cwd, path)
      } else if (i === 0) {
        modulePath = await resolveDirPath({
          root: inputs.cwd,
          name: moduleName,
          prefixes: ["./", "src"]
        })
      }

      const moduleConfig: AppManagerModule = {
        moduleName,
        modulePath,
        ignore: [/(^\.)|(^_)|(^common)|(^components)|(^node_modules)/],
        pageFilter: isRegExp(pageFilter) ? pageFilter : /^(\$?[a-zA-Z][a-zA-Z0-9]+\.page|page)$/,
        routerFilter: isRegExp(routerFilter) ? routerFilter : /^[a-zA-Z]+\.router$|^router$/,
        actionFilter: isRegExp(actionFilter) ? actionFilter : /^[a-zA-Z]+\.action$|^action$/,
        fileExtensions: [/\.ts$/, /\.tsx$/].concat(isArray(fileExtensions) ? (fileExtensions as RegExp[]) : []),
        iteration: iteration ?? "default"
      }
      if (!moduleConfig.modulePath) {
        throw `找不到${path ? "指定的" : "默认的"} app.module.path 入口`
      }
      if (isArray(ignore)) {
        const ignores = ignore.map(v => (isRegExp(v) ? v : new RegExp(`^${v}$`)))
        moduleConfig.ignore.push(...ignores)
      }
      return moduleConfig
    })
  )

  const ssrRender: AppManagerSSRRender = { sendMode: c.ssrRender?.sendMode ?? "string" }
  const manager: AppManager = {
    mainInput,
    mainSSRInput,
    ssrRender,
    router: routerConfig,
    modules: modulesConfig,
    realClientInput: "",
    realSSRInput: "",
    specialModules: []
  }
  return manager as AppManager
}
