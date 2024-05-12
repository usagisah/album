import { AlbumContext } from "@albumjs/album/server"
import react from "@vitejs/plugin-react-swc"
import { ParseMDConfig } from "./parser/parseMdToReact.js"

export type Category = { level: number; label: string; link: string; children: Category[] }

export interface LinkItem {
  label: string
  link?: string
}

export interface NestLinkItem extends LinkItem {
  children?: NestLinkItem[]
}

export interface DocsConfig {
  /* 所有 url 的前缀 */
  base?: string

  /* 标题 */
  title?: {
    value?: string
  }
  /* 站点图标 */
  icon?: string
  /* logo */
  logo?: {
    url?: string
    href?: string
  }

  /* 主题文件路径 */
  theme?: {
    custom?: string[]
  }

  /* 多语言 */
  lang?: {
    locales?: Record<string, { label: string; lang?: string; link?: string }>
  }

  /* 自定义 head */
  head?: string[]
  /* 自定义脚本 */
  script?: string[]
  /* html.footer */
  footer?: { message: string; copyright: string }

  /* 顶部导航链接选项 */
  navList: (LinkItem & {
    children?: LinkItem[]
  })[]
  /* 侧边栏选项 */
  sidebar: NestLinkItem[]
  /* 自定义功能性图标 */
  actions: (LinkItem & {
    children?: LinkItem[]
  })[]

  /* 搜索 */
  search?: boolean | {}

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
  demos: MDDemo[]
  routes: MDRoute[]
  routeMap: Map<string, MDRoute>
  albumContext: AlbumContext
}

export interface MDRoute {
  appName: string
  filepath: string
  routePath: string
  isErrorPage: boolean
  buildOutPath: string
  match: RegExp
  ext: string
}

export interface MDDemo {
  name: string
  filepath: string
}
