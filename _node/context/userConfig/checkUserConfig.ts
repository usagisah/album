import { z } from "zod"

const envValueValidator = z
  .array(
    z.union([z.record(z.string()), z.string()], {
      invalid_type_error: "config.env 每项必须是一个 对象/字符串"
    }),
    {
      invalid_type_error: "config.env 必须是一个数组"
    }
  )
  .optional()
export function checkUserConfig(userConfig: any) {
  const res = z
    .object({
      env: z
        .array(
          z.object({
            common: envValueValidator,
            production: envValueValidator,
            development: envValueValidator
          }),
          { invalid_type_error: "config.env 必须是一个数组" }
        )
        .optional(),
      app: z
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
        .optional(),
      ssrCompose: z
        .object(
          {
            dependencies: z.array(z.union([z.string(), z.record(z.record(z.any()))]), { invalid_type_error: "config.ssrCompose.dependencies 必须是一个数组" })
          },
          { invalid_type_error: "config.ssrCompose 必须是一个对象" }
        )
        .optional(),
      server: z
        .object(
          {
            port: z.number({ invalid_type_error: "config.server.port 必须是一个数字" }).optional()
          },
          { invalid_type_error: "config.server 必须是一个对象" }
        )
        .optional(),
      logger: z.union([
        z
          .object(
            {
              type: z.literal("custom"),
              logger: z.object({
                log: z.function(),
                error: z.function(),
                warn: z.function()
              })
            },
            { invalid_type_error: "config.logger 必须是一个对象" }
          )
          .optional(),
        z.object(
          {
            level: z.string({ invalid_type_error: "config.logger.level 必须是一个字符串" }).optional(),
            enableConsole: z.boolean({ invalid_type_error: "config.logger.enableConsole 必须是一个布尔值" }).optional(),
            consoleFormat: z.function().optional(),
            enableFile: z.boolean({ invalid_type_error: "config.logger.enableFile 必须是一个布尔值" }).optional(),
            fileOptions: z.union([z.record(z.any(), { invalid_type_error: "config.logger.fileOptions 必须是一个对象" }), z.function()]).optional()
          },
          { invalid_type_error: "config.logger 必须是一个对象" }
        )
      ]),
      plugins: z.array(z.record(z.object({ name: z.string() }).and(z.record(z.function())), { invalid_type_error: "config.plugins[] 每项必须是组件对象" }), { invalid_type_error: "config.plugins 必须是一个数组" }).optional(),
      vite: z.record(z.any(), { invalid_type_error: "config.vite 必须是一个 vite 配置对象" }).optional(),
      start: z
        .object(
          {
            root: z.string({ invalid_type_error: "config.start.root 必须是一个字符串" }).optional(),
            ssr: z
              .object(
                {
                  compose: z.boolean({ invalid_type_error: "config.start.ssr.compose 必须是一个布尔值" })
                },
                { invalid_type_error: "config.start.ssr 必须是一个对象" }
              )
              .optional()
          },
          { invalid_type_error: "config.start 必须是一个对象" }
        )
        .optional()
    })
    .safeParse(userConfig)

  if (!res.success) {
    throw res.error.errors.map(e => ({ config: e.path.join("."), message: e.message }))
  }
}
