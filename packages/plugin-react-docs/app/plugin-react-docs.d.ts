declare module "@docs/site-config" {
  export interface LinkItem {
    label?: string
    link?: string
    icon?: string
    children?: LinkItem[]
  }

  export interface SiteConfig {
    /* 标题 */
    title?: string
    /* 站点图标 */
    icon?: string
    /* 描述 */
    description?: string
    /* logo */
    logo?: string
    /* 当前路径 */
    path: string

    /* 路由文档元信息 */
    frontmatter: Record<string, number | string>

    /* 多语言 */
    lang?: {
      use?: string
      select?: { label?: string; link?: string; icon?: string }[]
      locales?: Record<string, any>
    }

    /* html.head {meta: { name: "xx" }} */
    head?: Record<string, Record<string, string>>
    /* html.footer */
    footer: { message: string; copyright: string }

    /* 导航链接选项 */
    navList: LinkItem[]
    /* 侧边栏选项 */
    sidebar: LinkItem[]

    layout: string
  }

  const siteConfig: SiteConfig
  export default siteConfig
}

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

declare module "album.docs" {
  import { LinkItem } from "@docs/site-config"
  import React from "react"
  export interface PageContext {
    store: Map<any, any>
    layouts: Record<string, React.FC<any>>
    components: Record<string, React.FC<any>>
    themeMode: {
      themeMode: string
      setThemeMode: (mode: string) => void
    }
    frontmatter: Record<string, number | string>
    layout: any
    footer: any
    site: {
      title: string
      description: string
      logo: string
      icon: string
      path: string
    }
    navList: LinkItem[]
    sidebar: LinkItem[]
    lang: {
      use?: string
      select?: { label?: string; link?: string; icon?: string }[]
      locales?: Record<string, any>
    }
  }
  export function usePage(): PageContext
}

declare module "*.md" {
  import { FC } from "react"
  const MDComponent: FC<any>
  export default MDComponent
}
