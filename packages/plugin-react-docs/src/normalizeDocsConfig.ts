import { array, boolean, lazy, object, record, string, union } from "@albumjs/tools/lib/zod"
import mt from "mime-types"
import { resolve } from "path"
import { DEFAULT_LOGO } from "./constants.js"
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
    base: string().optional(),

    title: object({
      value: string().optional(),
      sep: union([string(), boolean()]).optional()
    }).optional(),

    icon: string({ invalid_type_error: "docs.icon 必须是一个字符串" }).optional(),
    description: string({ invalid_type_error: "docs.description 必须是一个字符串" }).optional(),
    keywords: string({ invalid_type_error: "docs.keywords 必须是一个字符串" }).optional(),
    logo: object({
      url: string().optional(),
      href: string().optional()
    }).optional(),

    theme: object({
      custom: array(string(), { invalid_type_error: "docs.theme.custom 必须是一个指向实际主题入口文件的字符串数组" }).optional()
    }).optional(),

    lang: object(
      {
        actions: array(
          object({
            label: string(),
            link: string().optional()
          })
        ).optional()
      },
      { invalid_type_error: "docs.lang 必须是一个包含多语言配置的对象" }
    ).optional(),

    head: string().optional(),
    script: string().optional(),
    footer: object({
      message: string().optional(),
      copyright: string().optional()
    }).optional(),

    navList: array(linkItem).optional(),
    sidebar: array(linkItem).optional(),
    actions: array(linkItem).optional(),

    server: object({
      rewrites: record(string()).optional()
    }).optional()
  }).parse(config)
}

export function normalizeDocsConfig(config: DocsConfig) {
  validate(config)

  const { head = [], script = [], server, theme, ...siteConfig } = config
  const { base, title, icon, logo, description, keywords, lang, footer, navList, actions, sidebar, search } = siteConfig

  let resolveThemeFile = (cwd: string) => `export default []`
  if (theme) {
    if (theme.custom) {
      const { custom } = theme
      resolveThemeFile = cwd => {
        const exporter: string[] = []
        const importers = custom.map((item, index) => {
          return `import T${index}from ${resolve(cwd, item)}/client`
        })
        return importers.join("\n") + "\n" + `export default [${exporter.join(",")}]\n`
      }
    }
  }

  if (!base) siteConfig.base = ""

  if (!title) siteConfig.title = { sep: "|", value: "Album" }
  else {
    if (typeof title.sep !== "string") siteConfig.title.sep = "|"
    else siteConfig.title.sep = " "

    if (typeof title.value !== "string") siteConfig.title.value = "Album"
  }

  if (!icon) siteConfig.icon = { href: "/ico.svg", type: "image/svg+xml" } as any
  else {
    const index = icon.lastIndexOf(".")
    const ext = index === -1 ? "" : mt.lookup(icon.slice(index, -1))
    siteConfig.icon = { href: icon, type: ext } as any
  }

  if (!logo) siteConfig.logo = { url: DEFAULT_LOGO, href: "/" }
  else {
    if (!logo.href) siteConfig.logo.href = "/"
    if (!logo.url) siteConfig.logo.url = DEFAULT_LOGO
  }

  if (description) {
    head.push(`<meta name="description" content="${description}">`)
  }
  if (keywords) {
    head.push(`<meta name="keywords" content="${keywords}">`)
  }

  if (!lang) {
    siteConfig.lang = { actions: [] }
  } else {
    const { actions } = lang
    if (!actions) {
      siteConfig.lang = { actions: [] }
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
