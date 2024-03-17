import siteConfig from "@docs/site-config"
import themeConfigs, { ThemeConfig } from "@docs/site-theme"
import { ReactNode } from "react"
import ReactDom from "react-dom/client"
import { AppProvide } from "./hooks/useAppContext.tsx"
import { useThemeMode } from "./hooks/useThemeMode.ts"
import "./normalize.css"

async function mergeThemeConfig(defaultConfig: ThemeConfig) {
  let c = defaultConfig
  for (const config of themeConfigs) {
    await config(c)
  }
  return c
}

async function createStaticApp() {
  const themeConfig = await mergeThemeConfig({ meta: {}, layouts: {}, components: {} })
  const store = new Map()
  const appContext = {
    store,
    layouts: themeConfig.layouts,
    components: themeConfig.components,
    themeMode: useThemeMode(),
    layout: siteConfig.layout,
    footer: siteConfig.footer,
    site: {
      title: siteConfig.title,
      description: siteConfig.description
    },
    route: {
      path: siteConfig.path
    },
    lang: ""
  }
  const Layout = themeConfig.layouts[siteConfig.layout]
  const App = <AppProvide context={appContext}>{<Layout />}</AppProvide>

  ;(globalThis as any).__ALBUM_DOCS__ = "react"

  return App
}

if (import.meta.env.PROD) {
  createStaticApp().then((App: ReactNode) => ReactDom.hydrateRoot(document.getElementById("#album-docs")!, App))
} else {
  createStaticApp().then((App: ReactNode) => ReactDom.createRoot(document.getElementById("#album-docs")!).render(App))
}
