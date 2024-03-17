/// <reference types="vite/client" />

declare module "@docs/site-config" {
  export interface SiteConfig {
    title: string
    description: string

    footer: {
      message: string
      copyright: string
    }

    path: string
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
      title: any
      description: any
    }
    route: {
      path: any
    }
    lang: string
  }
  export function usePage(): PageContext
}
