import { renderToString } from "react-dom/server"
import { createApp } from "./createApp"

interface SSGRenderOption {
  url: string
  siteConfig: any
  head: string[] /* head import */
  script: string[] /* script import */
  importPath: string /* md content import by node */
  contentPath: string /* md content import by browser */
  entryPath: string /* client entry of js-script */
  demoClientPath: string /* demo-box by browser */
}

import emotionCreateCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import createEmotionServer from "@emotion/server/create-instance"
const emotionCache = emotionCreateCache({ key: "album" })
const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(emotionCache)

import { StyleProvider, createCache as antCreateCache, extractStyle } from "@ant-design/cssinjs"
import { PageContext } from "album.docs"
const antCache = antCreateCache()

export async function ssgRender(options: SSGRenderOption) {
  const { url, siteConfig, entryPath, importPath, contentPath, head, script, demoClientPath } = options
  const { default: MDContent } = await import(/*@vite-ignore*/ importPath)
  siteConfig.category = MDContent.category
  siteConfig.frontmatter = MDContent.frontmatter

  const App = await createApp(url, siteConfig, MDContent)
  const appHtml = renderToString(
    <StyleProvider cache={antCache}>
      <CacheProvider value={emotionCache}>
        <App />
      </CacheProvider>
    </StyleProvider>
  )

  const langManager = new LangManager(siteConfig.lang)

  const emotionStyles = constructStyleTagsFromChunks(extractCriticalToChunks(appHtml))
  const antStyles = extractStyle(antCache)

  const siteTitle = MDContent.frontmatter.siteTitle ?? MDContent.category[0]?.label ?? siteConfig.title.value

  const html = `<html lang="${langManager.getHTMLLang(url)}" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="${siteConfig.icon.type}" href="${siteConfig.icon.href}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${siteTitle}</title>
    ${head.join("")}
    ${emotionStyles}
    ${antStyles}
    <script>
      let m = localStorage.getItem("_site-theme-mode")
      if (m === "system") m = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
      document.documentElement.classList.add(m)
    </script>
  </head>
  <body>
    <div id="album-docs">
      <App />
    </div>
    <script type="text/json" id="_docs-meta">${JSON.stringify({ contentPath, demoClientPath })}</script>
    <script>
      Array.from(document.querySelectorAll("img")).forEach(m => {
        m.onerror = function(e){this.classList.add("error")
      }})
    </script>
    ${script.join("")}
    <script type="module" src="${entryPath}"></script>
  </body>
</html>`
  return html
}

class LangManager {
  static manager: LangManager
  #localeMap = new Map<string, { label: string; lang?: string; link?: string }>()
  constructor(lang: PageContext["lang"]) {
    if (LangManager.manager) {
      return LangManager.manager
    }

    const { locales } = lang
    for (const dir in locales) {
      this.#localeMap.set(dir, locales[dir])
    }
  }

  getHTMLLang(url: string): string {
    const { pathname } = new URL("a://a" + url)
    const key = pathname.split("/")[1]

    let res
    if (this.#localeMap.has(key)) {
      res = this.#localeMap.get(key)?.lang ?? key
    } else {
      res = this.#localeMap.get("root")?.lang
    }
    return res ?? "en"
  }
}
