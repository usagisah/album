import { AlbumContext } from "@albumjs/album/server"
import react from "@vitejs/plugin-react-swc"
import { ParseMDConfig } from "./parser/parseMdToReact.js"

export type Category = { level: number; label: string; children: Category[] }

export interface LinkItem {
  label?: string
  link?: string
  icon?: string
  children?: LinkItem[]
}
export interface DocsConfig {
  /* 所有 url 的前缀 */
  base?: string

  /* 标题 */
  title?: {
    value?: string
    sep?: string | boolean
  }
  /* 站点图标 */
  icon?: string
  /* 描述 */
  description?: string
  /* 关键词 */
  keywords?: string
  /* logo */
  logo?: {
    url?: string
    href?: string
  }

  /* 主题文件路径 */
  theme?: string[]

  /* 多语言 */
  lang?: {
    use?: string
    select?: { label?: string; link?: string; icon?: string }[]
    locales?: Record<string, any>
  }

  /* 自定义 head */
  head?: string[]
  /* 自定义脚本 */
  script?: string[]
  /* html.footer */
  footer?: { message: string; copyright: string }

  /* 导航链接选项 */
  navList?: LinkItem[]
  /* 侧边栏选项 */
  sidebar?: LinkItem[]
  /* 自定义功能性图标 */
  actions?: LinkItem[]

  /* 静态资源服务器配置 */
  server?: {
    /* 路径重写规则 'packages/:pkg/src/(.*)': ':pkg/index.md' */
    rewrites: Record<string, string>
    /* 其他静态服务器相关的 */
  }
}

type ReactPlugin = Parameters<typeof react>[0]

export interface PluginContext {
  parseMDConfig: ParseMDConfig
  reactConfig: ReactPlugin
  docsConfig: {
    head: string[]
    script: string[]
    siteConfig: any
    server: DocsConfig["server"]
    resolveThemeFile: (cwd: string) => string
  }
  routes: MDRoute[]
  routeMap: Map<string, MDRoute>
  albumContext: AlbumContext
}

export interface MDRoute {
  appName: string
  filepath: string
  buildOutPath?: string
  match: RegExp
  ext: string
}
