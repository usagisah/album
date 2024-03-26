import { any, array, lazy, object, record, string } from "@albumjs/tools/lib/zod"
import { resolve } from "path"
import { DocsConfig } from "./docs.type.js"

const linkItem: any = lazy(() => {
  return object({
    label: string().optional(),
    link: string().optional(),
    icon: string().optional(),
    children: array(linkItem).optional()
  })
})

function validate(config: DocsConfig) {
  if (!config) {
    return
  }

  return object({
    title: string({ invalid_type_error: "docs.title 必须是一个字符串" }).optional(),
    icon: string({ invalid_type_error: "docs.icon 必须是一个字符串" }).optional(),
    logo: string({ invalid_type_error: "docs.logo 必须是一个字符串" }).optional(),
    description: string({ invalid_type_error: "docs.description 必须是一个字符串" }).optional(),

    theme: array(string(), { invalid_type_error: "docs.theme 必须是一个指向实际主题入口文件的字符串数组" }).optional(),

    lang: object(
      {
        use: string({ invalid_type_error: "docs.lang.default 必须是一个字符串" }).optional(),
        select: array(
          object({
            label: string().optional(),
            link: string().optional(),
            icon: string().optional()
          })
        ).optional(),
        locales: record(any(), { invalid_type_error: "docs.lang.locales 必须是一个包含多种语言的配置 json 对象" }).optional()
      },
      { invalid_type_error: "docs.lang 必须是一个包含多语言配置的对象" }
    ).optional(),

    head: record(record(string()).optional()).optional(),
    footer: object({
      message: string().optional(),
      copyright: string().optional()
    }).optional(),
    scripts: array(
      object({
        attrs: record(string()).optional(),
        content: string().optional()
      })
    ).optional(),

    navList: array(linkItem).optional(),
    sidebar: array(linkItem).optional(),

    server: object({
      rewrites: record(string()).optional()
    }).optional()
  }).parse(config)
}

export function normalizeDocsConfig(config: DocsConfig) {
  validate(config)

  const { scripts, server, theme, ...siteConfig } = config

  let resolveThemeFile = (cwd: string) => "export default []"
  if (theme) {
    resolveThemeFile = cwd => {
      const exporter: string[] = []
      const importers = theme.map((item, index) => {
        return `import T${index}from ${resolve(cwd, item)}`
      })
      return importers.join("\n") + "\n" + `export default [${exporter.join(",")}]\n`
    }
  }

  const { title } = siteConfig
  if (!title) siteConfig.title = "AlbumPress"
  return { scripts: scripts ?? [], resolveThemeFile, server, siteConfig }
}
