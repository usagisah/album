declare module "@docs/site-theme" {
  import { FC } from "react"

  export interface ThemeConfig {
    meta: Record<string, any>
    layouts: Record<string, FC<any>>
    components: Record<string, FC<any>>
  }
  export interface ThemeFactory {
    (config: ThemeConfig): any
  }

  const themeExports: ThemeFactory[]
  export default themeExports
}

declare module "@docs/site-config" {
  export const siteConfig: Record<any, any>
}

declare module "album.docs" {
  export interface LinkItem {
    label?: string
    link?: string
    icon?: string
    children?: LinkItem[]
  }

  export interface PageContext {
    /* 所有 url 的前缀 */
    base: string

    /* 标题 */
    title: {
      value: string
      sep: string
    }
    /* 站点图标 */
    icon: string
    /* logo */
    logo: {
      url: string
      href: string
    }

    /* 多语言 */
    lang: {
      use: string
      select: { label?: string; link?: string; icon?: string }[]
      locales: Record<string, any>
    }

    /* html.footer */
    footer: { message?: string; copyright?: string }

    /* 导航链接选项 */
    navList: LinkItem[]
    /* 侧边栏选项 */
    sidebar: LinkItem[]
    /* 自定义功能性图标 */
    actions: LinkItem[]

    /* 路由文档元信息 */
    frontmatter: Record<string, any>

    /* 公共储存 */
    store: Map<any, any>
    /* 公共事件 */
    events: Map<string, any>

    /* 布局文件 */
    layouts: Record<string, React.FC<any>>
    /* 子组件 */
    components: Record<string, React.FC<any>>

    /* 主题信息 */
    theme: {
      themeMode: string
      setThemeMode: (mode: string) => void
    }

    /* 当前使用的布局 */
    layout: string

    location: { href: string; hash: string; pathname: string; query: Record<string, string> }
  }
  export function usePage(): PageContext
}

declare module "*.md" {
  import { FC } from "react"
  const MDComponent: FC<any> & { $frontmatter: Record<string, string | number> }
  export default MDComponent
}
