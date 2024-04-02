import { any, array, boolean, function as function_, literal, number, object, record, string, union } from "@albumjs/tools/lib/zod"
import { isRegExp } from "@albumjs/tools/node"

const regexp = (message = "不是一个正则表达式") => {
  return any().refine(v => isRegExp(v), { message })
}

const envValidator = array(
  union([
    object({
      common: record(string(), { invalid_type_error: "config.env.common 必须是一个对象" }).optional(),
      production: record(string(), { invalid_type_error: "config.env.production 必须是一个对象" }).optional(),
      development: record(string(), { invalid_type_error: "config.env.development 必须是一个对象" }).optional()
    }),
    string()
  ]),
  { invalid_type_error: "config.env 必须是一个数组" }
).optional()

const appModule = object(
  {
    path: string({ invalid_type_error: "config.app.module.path 必须是一个字符串" }).optional(),
    name: string({ invalid_type_error: "config.app.module.name 必须是一个字符串" }).optional(),
    ignore: array(union([string(), regexp()], { invalid_type_error: "config.app.module.ignore 必须是一个(正则|字符串)数组" })).optional(),
    pageFilter: union([string(), regexp()], { invalid_type_error: "config.app.module.pageFilter 必须是一个(正则|字符串)" }).optional(),
    routerFilter: union([string(), regexp()], { invalid_type_error: "config.app.module.routerFilter 必须是一个(正则|字符串)" }).optional(),
    actionFilter: union([string(), regexp()], { invalid_type_error: "config.app.module.actionFilter 必须是一个(正则|字符串)" }).optional(),
    fileExtensions: array(union([string(), regexp()], { invalid_type_error: "config.app.module.fileExtensions 必须是一个(正则|字符串)数组" })).optional(),
    iteration: literal("flat", { invalid_type_error: "config.app.module.literal 必须是一个 (undefined|flat)" }).optional()
  },
  { invalid_type_error: "config.app.module 必须是一个对象" }
).optional()
const appValidator = object({
  id: string({ invalid_type_error: "config.app.id 必须是一个字符串" }).optional(),
  main: string({ invalid_type_error: "config.app.main 必须是一个字符串" }).optional(),
  mainSSR: string({ invalid_type_error: "config.app.mainSSR 必须是一个字符串" }).optional(),
  ssrRender: object(
    {
      sendMode: union([literal("pipe"), literal("string")], { invalid_type_error: "config.app.ssrRender.sendMode 必须是(pipe|string)其中一个" }).optional()
    },
    { invalid_type_error: "config.app.ssrRender 必须是一个对象" }
  ).optional(),
  module: union([appModule, array(appModule)]).optional(),
  router: object(
    {
      basename: string({ invalid_type_error: "config.app.router.basename 必须是一个字符串" }).optional(),
      redirect: record(string({ invalid_type_error: "config.app.router.redirect[item] 子项必须是字符串" }), {
        invalid_type_error: "config.app.router.redirect 必须是一个字符串对象"
      }).optional()
    },
    { invalid_type_error: "config.app.router 必须是一个对象" }
  ).optional()
}).optional()

const ssrComposeValidator = object(
  {
    dependencies: array(string(), { invalid_type_error: "config.ssrCompose.dependencies 必须是一个字符串数组" }).optional(),
    castExtensions: array(string(), { invalid_type_error: "config.ssrCompose.castExtensions 必须是一个字符串数组" }).optional(),
    startRoot: string({ invalid_type_error: "config.ssrCompose.startRoot 必须是一个指向具体路径的字符串" }).optional(),
    rewrites: array(
      object({
        encode: function_(),
        decode: function_()
      }),
      { invalid_type_error: "config.ssrCompose.rewrites 必须是一个数组加解密对象" }
    ).optional()
  },
  { invalid_type_error: "config.ssrCompose 必须是一个对象" }
).optional()

const serverValidator = object(
  {
    port: number({ invalid_type_error: "config.server.port 必须是一个数字" }).optional(),
    appModule: string({ invalid_type_error: "config.server.appModule 必须是一个路径字符串" }).optional(),
    builtinModules: boolean({ invalid_type_error: "config.server.builtinModules 必须是一个布尔值" }).optional(),
    tsconfig: record(union([string(), regexp()]), { invalid_type_error: "config.server.tsconfig 必须是一个指向(tsconfig)的配置文件，或者是(tsconfig)配置对象" }).optional()
  },
  { invalid_type_error: "config.server 必须是一个对象" }
).optional()

const loggerValidator = object(
  {
    level: string({ invalid_type_error: "config.logger.level 必须是一个字符串" }).optional(),
    enableConsole: boolean({ invalid_type_error: "config.logger.enableConsole 必须是一个布尔值" }).optional(),
    consoleFormat: function_().optional(),
    enableFile: boolean({ invalid_type_error: "config.logger.enableFile 必须是一个布尔值" }).optional(),
    fileOptions: union([record(any(), { invalid_type_error: "config.logger.fileOptions 必须是一个对象" }), function_()]).optional()
  },
  { invalid_type_error: "config.logger 必须是一个对象" }
).optional()

export function checkUserConfig(userConfig: any) {
  const res = object({
    root: string({ invalid_type_error: "config.root 必须是一个字符串" }).optional(),
    env: envValidator,
    app: union([appValidator, array(ssrComposeValidator)], { invalid_type_error: "config.app 必须是一个对象或者数组" }).optional(),
    ssrCompose: ssrComposeValidator,
    server: serverValidator,
    logger: loggerValidator,
    plugins: array(
      object({
        name: string()
      }).or(record(function_())),
      { invalid_type_error: "config.plugins[] 每项必须是组件对象" }
    ).optional(),
    vite: record(any(), { invalid_type_error: "config.vite 必须是一个 vite 配置对象" }).optional()
  }).safeParse(userConfig)
  if (!res.success) throw (res as any).error.errors.map(e => ({ config: e.path.join("."), message: e.message }))
}
