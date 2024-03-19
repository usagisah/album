/// <reference types="vite/client" />

declare module "@docs/site-config" {
  export interface LinkItem {
    label?: string
    link?: string
    icon?: string
    children?: LinkItem[]
  }

  export interface SiteConfig {
    title: string
    icon: string
    logo: string
    description: string
    path: string

    navList: LinkItem[]
    lang: LinkItem[]

    sidebar: LinkItem[]

    footer: {
      message: string
      copyright: string
    }

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
    lang: LinkItem[]
  }
  export function usePage(): PageContext
}
