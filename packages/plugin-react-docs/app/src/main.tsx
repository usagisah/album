import siteConfig from "@docs/site-config"
import themeConfigs, { ThemeConfig } from "@docs/site-theme"
import { PageContext } from "album.docs"
import { createRoot, hydrateRoot } from "react-dom/client"
import { NavBar } from "./components/NavBar/NavBar.tsx"
import { NavSearch } from "./components/NavSearch/NavSearch.tsx"
import { NavTitle } from "./components/NavTitle/NavTitle.tsx"
import { SelectMenu } from "./components/SelectMenu/SelectMenu.tsx"
import { AppProvide } from "./hooks/useAppContext.tsx"
import { useThemeMode } from "./hooks/useThemeMode.ts"
import { HomeLayout } from "./layout/Home/Home.tsx"
import "./normalize.css"

async function mergeThemeConfig(defaultConfig: ThemeConfig) {
  let c = defaultConfig
  for (const config of themeConfigs) {
    await config(c)
  }
  return c
}

async function createStaticApp() {
  ;(globalThis as any).__ALBUM_DOCS__ = "react"

  const themeConfig = await mergeThemeConfig({
    meta: {},
    layouts: { Home: HomeLayout },
    components: {
      NavBar,
      NavSearch,
      NavTitle,
      SelectMenu
    }
  })

  const store = new Map()
  const appContext: PageContext = {
    store,
    layouts: themeConfig.layouts,
    components: themeConfig.components,
    themeMode: null as any,
    layout: siteConfig.layout,
    footer: siteConfig.footer,
    site: {
      title: siteConfig.title,
      description: siteConfig.description,
      logo: siteConfig.logo,
      icon: siteConfig.icon,
      path: siteConfig.path
    },
    navList: siteConfig.navList,
    lang: siteConfig.lang
  }

  return () => {
    appContext.themeMode = useThemeMode()
    const Layout = themeConfig.layouts[siteConfig.layout]
    return (
      <AppProvide context={appContext}>
        <Layout />
      </AppProvide>
    )
  }
}

if (import.meta.env.PROD) {
  createStaticApp().then(App => hydrateRoot(document.getElementById("album-docs")!, <App />))
} else {
  createStaticApp().then(App => createRoot(document.getElementById("album-docs")!).render(<App />))
}
