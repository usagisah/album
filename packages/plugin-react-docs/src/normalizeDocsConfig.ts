import { array, lazy, object, record, string } from "@albumjs/tools/lib/zod"
import { isString } from "@albumjs/tools/node"
import mt from "mime-types"
import { resolve } from "path"
import { DocsConfig } from "./docs.type.js"

const nestLinkItem: any = lazy(() => {
  return object({
    label: string().optional(),
    link: string().optional(),
    children: array(nestLinkItem).optional()
  })
})

function validate(config: DocsConfig) {
  if (!config) {
    return
  }

  return object({
    base: string().optional(),

    title: object({
      value: string().optional()
    }).optional(),

    icon: string({ invalid_type_error: "docs.icon 必须是一个字符串" }).optional(),
    logo: object({
      url: string().optional(),
      href: string().optional()
    }).optional(),

    theme: object({
      custom: array(string(), { invalid_type_error: "docs.theme.custom 必须是一个指向实际主题入口文件的字符串数组" }).optional()
    }).optional(),

    lang: record(
      object({
        locales: object({
          label: string(),
          lang: string().optional(),
          link: string().optional()
        }).optional()
      })
    ).optional(),

    head: string().optional(),
    script: string().optional(),
    footer: object({
      message: string().optional(),
      copyright: string().optional()
    }).optional(),

    navList: array(
      object({
        label: string(),
        link: string().optional(),
        children: array(object({ label: string(), link: string().optional() })).optional()
      })
    ).optional(),
    sidebar: array(nestLinkItem).optional(),
    actions: array(
      object({
        label: string(),
        link: string().optional(),
        children: array(object({ label: string(), link: string().optional() })).optional()
      })
    ).optional(),

    server: object({
      rewrites: record(string()).optional()
    }).optional()
  }).parse(config)
}

export function normalizeDocsConfig(config: DocsConfig) {
  validate(config)

  const { head = [], script = [], server, theme, ...siteConfig } = config
  const { base, title, icon, logo, lang, footer, navList, actions, sidebar, search } = siteConfig

  let resolveThemeFile = (cwd: string) => `export default []`
  if (theme) {
    if (theme.custom) {
      const { custom } = theme
      resolveThemeFile = cwd => {
        const exporter: string[] = []
        const importers = custom.map((item, index) => {
          const name = `T${index}`
          const path = item.startsWith("/") ? item : resolve(cwd, item)
          exporter.push(name)
          return `import ${name} from "${path}"`
        })
        return importers.join("\n") + "\n" + `export default [${exporter.join(",")}]\n`
      }
    }
  }

  if (!base) siteConfig.base = ""

  if (!title) siteConfig.title = { value: "Album" }
  else {
    if (!isString(title.value)) siteConfig.title.value = "Album"
  }

  if (!icon) siteConfig.icon = { href: "/logo.svg", type: "image/svg+xml" } as any
  else {
    const index = icon.lastIndexOf(".")
    const ext = index === -1 ? "" : mt.lookup(icon.slice(index, -1))
    siteConfig.icon = { href: icon, type: ext } as any
  }

  if (!logo) siteConfig.logo = { url: "/", href: "/logo.svg" }
  else {
    if (!logo.href) siteConfig.logo.href = "/logo.svg"
    if (!logo.url) siteConfig.logo.url = "/"
  }

  if (!lang) {
    siteConfig.lang = { locales: {} }
  } else {
    const { locales } = lang
    if (!locales) {
      siteConfig.lang.locales = {}
    }
  }

  if (!footer) {
    siteConfig.footer = { copyright: null, message: null }
  }

  if (!navList) siteConfig.navList = []
  if (!actions) siteConfig.actions = []
  if (!sidebar) siteConfig.sidebar = []

  if (!search) siteConfig.search = false

  return { head, script, resolveThemeFile, server, siteConfig }
}
