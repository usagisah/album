import siteConfig from "@docs/site-config"
import themeConfigs, { ThemeConfig } from "@docs/site-theme"
import { PageContext } from "album.docs"
import { Collapse, Switch } from "antd"
import { createRoot, hydrateRoot } from "react-dom/client"
import { Category } from "./components/Category/Category.tsx"
import { EditInfo } from "./components/EditInfo/EditInfo"
import { Features } from "./components/Features/Features.tsx"
import { Footer } from "./components/Footer/Footer.tsx"
import { Github } from "./components/Github/Github.tsx"
import { Header } from "./components/Header/Header.tsx"
import { Lang } from "./components/Lang/Lang.tsx"
import { NavBar } from "./components/NavBar/NavBar.tsx"
import { NavSearch } from "./components/NavSearch/NavSearch.tsx"
import { NavTitle } from "./components/NavTitle/NavTitle.tsx"
import { PrevNext } from "./components/PrevNext/PrevNext.tsx"
import { SelectMenu } from "./components/SelectMenu/SelectMenu.tsx"
import { Sidebar } from "./components/Sidebar/Sidebar.tsx"
import { AppProvide } from "./hooks/useAppContext.tsx"
import { useThemeMode } from "./hooks/useThemeMode.ts"
import { DocsLayout } from "./layout/Docs/Docs.tsx"
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
    layouts: { default: DocsLayout, Home: HomeLayout, Docs: DocsLayout },
    components: {
      NavBar,
      NavSearch,
      NavTitle,
      SelectMenu,
      Features,
      Header,
      Footer,
      Github,
      Lang,
      EditInfo,
      Sidebar,
      PrevNext,
      Switch,
      Category,
      Collapse
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
    sidebar: siteConfig.sidebar,
    lang: siteConfig.lang
  }

  return () => {
    appContext.themeMode = useThemeMode()
    const Layout = themeConfig.layouts[siteConfig.layout ?? "default"]
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
