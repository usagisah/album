import themeConfigs from "@docs/site-theme"
import { ThemeProvider } from "@emotion/react"
import { PageContext } from "album.docs"
import { theme as AntTheme, Collapse, ConfigProvider } from "antd"
import { FC, useState } from "react"
import { Category } from "./components/Category/Category"
import { DemoBox } from "./components/DemoBox/DemoBox"
import { EditInfo } from "./components/EditInfo/EditInfo"
import { Features } from "./components/Features/Features"
import { Footer } from "./components/Footer/Footer"
import { Header } from "./components/Header/Header"
import { IconDown } from "./components/Icon/IconDown"
import { IconMenuOutlined } from "./components/Icon/IconMenuOutlined"
import { Lang } from "./components/Lang/Lang"
import { NavBar } from "./components/NavBar/NavBar"
import { NavSearch } from "./components/NavSearch/NavSearch"
import { NavTitle } from "./components/NavTitle/NavTitle"
import { PrevNext } from "./components/PrevNext/PrevNext"
import { SelectMenu } from "./components/SelectMenu/SelectMenu"
import { Sidebar } from "./components/Sidebar/Sidebar"
import { AppProvide } from "./hooks/useAppContext"
import { useTheme } from "./hooks/useTheme"
import { DocsLayout } from "./layout/Docs/Docs"
import { ErrorLayout } from "./layout/Error/Error"
import { HomeLayout } from "./layout/Home/Home"
import { GlobalStyle } from "./theme"

console.error = () => {}

export async function createApp(url: string, siteConfig: any, Content: FC<any>) {
  const { locales } = siteConfig.lang as { locales: Record<string, { label: string; lang?: string; link?: string }> }
  const lang = {
    locales: Object.keys(locales).map(key => {
      const { label, lang, link } = locales[key]
      const _link = link ?? (key === "root" ? "/" : `/${key}/`)
      return {
        label: <a href={_link}>{label}</a>,
        key,
        lang: lang ?? key,
        link: _link
      }
    })
  }

  const { href, hash, pathname, searchParams } = import.meta.env.SSR ? new URL(`a://a${url}`) : new URL(location.href)
  const query = [...searchParams.entries()].reduce((q, item) => {
    q[decodeURIComponent(item[0])] = decodeURIComponent(item[1])
    return q
  }, {} as any)

  const store = new Map()
  const events = new Map()
  events.set("copy", async (e: any) => {
    await navigator.clipboard.writeText(e.target.parentElement.nextElementSibling.textContent)
    return true
  })

  const appContext: PageContext = {
    ...siteConfig,
    lang,
    store,
    events,
    layouts: { default: DocsLayout, Home: HomeLayout, Docs: DocsLayout, Error: ErrorLayout },
    components: {
      NavBar,
      NavSearch,
      NavTitle,
      SelectMenu,
      Features,
      Header,
      Footer,
      Lang,
      EditInfo,
      Sidebar,
      PrevNext,
      Category,
      Collapse,
      Content,
      IconDown,
      IconMenuOutlined,
      DemoBox
    },
    theme: null as any,
    layout: siteConfig.frontmatter.layout ?? "default",
    location: { href, hash, pathname, query }
  }

  return () => {
    const [_, flush] = useState(0)
    appContext.fullFlush = () => flush(Math.random())

    const _theme = useTheme()
    appContext.components.ThemeAction = _theme.ThemeAction
    appContext.theme = _theme

    for (const config of themeConfigs) {
      config(appContext)
    }

    let Layout = appContext.layouts[appContext.layout]
    if (!Layout) {
      Layout = appContext.layouts.default
      console.log(`album-react-docs ssr-error: 找不到使用的布局组件(${siteConfig.layout}), 回退到默认`)
    }
    return (
      <AppProvide context={appContext}>
        <ThemeProvider theme={_theme.style}>
          <ConfigProvider theme={{ algorithm: _theme.currentTheme === "light" ? AntTheme.defaultAlgorithm : AntTheme.darkAlgorithm }}>
            <GlobalStyle theme={_theme.style} />
            <Layout />
          </ConfigProvider>
        </ThemeProvider>
      </AppProvide>
    )
  }
}
