import { AlbumContext } from "@albumjs/album/server"
import react from "@vitejs/plugin-react-swc"
import { ParseMDConfig } from "./parser/parseMdToReact.js"

export interface LinkItem {
  label?: string
  link?: string
  icon?: string
  children?: LinkItem[]
}
export interface DocsConfig {
  /* 标题 */
  title?: string
  /* 站点图标 */
  icon?: string
  /* 描述 */
  description?: string
  /* logo */
  logo?: string

  /* 主题文件路径 */
  theme?: string[]

  /* 多语言 */
  lang?: {
    use?: string
    select?: { label?: string; link?: string; icon?: string }[]
    locales?: Record<string, any>
  }

  /* html.head {meta: { name: "xx" }} */
  head?: Record<string, Record<string, string>>
  /* <script /> 自定义脚本相关的 */
  scripts?: { attrs?: Record<string, string | number>; content?: string }[]
  /* html.footer */
  footer: { message: string; copyright: string }

  /* 导航链接选项 */
  navList: LinkItem[]
  /* 侧边栏选项 */
  sidebar: LinkItem[]

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
    scripts: DocsConfig["scripts"]
    siteConfig: any
    server: DocsConfig["server"]
    resolveThemeFile: (cwd: string) => string
  }
  outDir: string
  routes: MDRoute[]
  routeMap: Map<string, MDRoute>
  albumContext: AlbumContext
}

export interface MDRoute {
  filepath: string
  outPath?: string
  match: RegExp
  ext: string
}
