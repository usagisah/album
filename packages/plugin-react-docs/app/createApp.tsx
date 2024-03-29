import { SiteConfig } from "@docs/site-config"
import themeConfigs, { ThemeConfig } from "@docs/site-theme"
import { ThemeProvider } from "@emotion/react"
import { PageContext } from "album.docs"
import { Collapse, Switch } from "antd"
import { FC } from "react"
import { Category } from "./components/Category/Category"
import { EditInfo } from "./components/EditInfo/EditInfo"
import { Features } from "./components/Features/Features"
import { Footer } from "./components/Footer/Footer"
import { Github } from "./components/Github/Github"
import { Header } from "./components/Header/Header"
import { Lang } from "./components/Lang/Lang"
import { NavBar } from "./components/NavBar/NavBar"
import { NavSearch } from "./components/NavSearch/NavSearch"
import { NavTitle } from "./components/NavTitle/NavTitle"
import { PrevNext } from "./components/PrevNext/PrevNext"
import { SelectMenu } from "./components/SelectMenu/SelectMenu"
import { Sidebar } from "./components/Sidebar/Sidebar"
import { AppProvide } from "./hooks/useAppContext"
import { useThemeMode } from "./hooks/useThemeMode"
import { DocsLayout } from "./layout/Docs/Docs"
import { HomeLayout } from "./layout/Home/Home"
import { GlobalStyle, THEME } from "./theme"

async function mergeThemeConfig(defaultConfig: ThemeConfig) {
  let c = defaultConfig
  for (const config of themeConfigs) {
    await config(c)
  }
  return c
}

export async function createApp(siteConfig: SiteConfig, Content: FC<any>) {
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
      Collapse,
      Content
    }
  })
  const store = new Map()
  const appContext: PageContext = {
    store,
    layouts: themeConfig.layouts,
    components: themeConfig.components,
    themeMode: null as any,
    layout: siteConfig.frontmatter.layout ?? "default",
    footer: siteConfig.footer,
    frontmatter: siteConfig.frontmatter,
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
    let Layout = themeConfig.layouts[appContext.layout]
    if (!Layout) {
      Layout = themeConfig.layouts.default
      console.log(`album-react-docs ssr-error: 找不到使用的布局组件(${siteConfig.layout}), 回退到默认`)
    }
    return (
      <AppProvide context={appContext}>
        <ThemeProvider theme={THEME}>
          <GlobalStyle theme={THEME} />
          <Layout />
        </ThemeProvider>
      </AppProvide>
    )
  }
}
