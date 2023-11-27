import { z } from "zod"

const envValidator = z
  .array(
    z.object({
      common: z
        .array(
          z.union([z.record(z.string()), z.string()], {
            invalid_type_error: "config.env.common 每项必须是一个 对象/字符串"
          }),
          {
            invalid_type_error: "config.env.common 必须是一个数组"
          }
        )
        .optional(),
      production: z
        .array(
          z.union([z.record(z.string()), z.string()], {
            invalid_type_error: "config.env.production 每项必须是一个 对象/字符串"
          }),
          {
            invalid_type_error: "config.env.production 必须是一个数组"
          }
        )
        .optional(),
      development: z
        .array(
          z.union([z.record(z.string()), z.string()], {
            invalid_type_error: "config.env.development 每项必须是一个 对象/字符串"
          }),
          {
            invalid_type_error: "config.env.development 必须是一个数组"
          }
        )
        .optional()
    }),
    { invalid_type_error: "config.env 必须是一个数组" }
  )
  .optional()

const appValidator = z
  .object(
    {
      id: z.string({ invalid_type_error: "config.app.id 必须是一个字符串" }).optional(),
      main: z.string({ invalid_type_error: "config.app.main 必须是一个字符串" }).optional(),
      mainSSR: z.string({ invalid_type_error: "config.app.mainSSR 必须是一个字符串" }).optional(),
      module: z
        .object(
          {
            path: z.string({ invalid_type_error: "config.app.module.path 必须是一个字符串" }).optional(),
            name: z.string({ invalid_type_error: "config.app.module.name 必须是一个字符串" }).optional()
          },
          { invalid_type_error: "config.app.module 必须是一个对象" }
        )
        .optional(),
      router: z
        .object(
          {
            basename: z.string({ invalid_type_error: "config.app.router.basename 必须是一个字符串" }).optional()
          },
          { invalid_type_error: "config.app.router 必须是一个对象" }
        )
        .optional()
    },
    { invalid_type_error: "config.app 必须是一个对象" }
  )
  .optional()

const ssrComposeValidator = z
  .object(
    {
      dependencies: z.array(z.string(), { invalid_type_error: "config.ssrCompose.dependencies 必须是一个字符串数组" })
    },
    { invalid_type_error: "config.ssrCompose 必须是一个对象" }
  )
  .optional()

const serverValidator = z
  .object(
    {
      port: z.number({ invalid_type_error: "config.server.port 必须是一个数字" }).optional()
    },
    { invalid_type_error: "config.server 必须是一个对象" }
  )
  .optional()

const loggerValidator = z.object(
  {
    level: z.string({ invalid_type_error: "config.logger.level 必须是一个字符串" }).optional(),
    enableConsole: z.boolean({ invalid_type_error: "config.logger.enableConsole 必须是一个布尔值" }).optional(),
    consoleFormat: z.function().optional(),
    enableFile: z.boolean({ invalid_type_error: "config.logger.enableFile 必须是一个布尔值" }).optional(),
    fileOptions: z.union([z.record(z.any(), { invalid_type_error: "config.logger.fileOptions 必须是一个对象" }), z.function()]).optional()
  },
  { invalid_type_error: "config.logger 必须是一个对象" }
)

const startValidator = z
  .object(
    {
      root: z.string({ invalid_type_error: "config.start.root 必须是一个字符串" }).optional()
    },
    { invalid_type_error: "config.start 必须是一个对象" }
  )
  .optional()

export function checkUserConfig(userConfig: any) {
  const res = z
    .object({
      env: envValidator,
      app: appValidator,
      ssrCompose: ssrComposeValidator,
      server: serverValidator,
      logger: loggerValidator,
      plugins: z
        .array(
          z
            .object({
              name: z.string()
            })
            .and(z.record(z.function())),
          { invalid_type_error: "config.plugins[] 每项必须是组件对象" }
        )
        .optional(),
      vite: z.record(z.any(), { invalid_type_error: "config.vite 必须是一个 vite 配置对象" }).optional(),
      start: startValidator
    })
    .safeParse(userConfig)
  if (!res.success) throw res.error.errors.map(e => ({ config: e.path.join("."), message: e.message }))
}
