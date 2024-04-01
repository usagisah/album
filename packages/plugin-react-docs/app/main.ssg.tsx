import { renderToString } from "react-dom/server"
import { createApp } from "./createApp"

interface SSGRenderOption {
  url: string
  siteConfig: any
  head: string[]
  script: string[]
  importPath: string
  contentPath: string
  entryPath: string
}

import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import createEmotionServer from "@emotion/server/create-instance"
const key = "custom"
const cache = createCache({ key })
const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)

export async function ssgRender({ url, siteConfig, entryPath, importPath, contentPath, head, script }: SSGRenderOption) {
  const { default: MDContent } = await import(/*@vite-ignore*/ importPath)
  siteConfig.category = MDContent.category
  siteConfig.frontmatter = MDContent.frontmatter

  const App = await createApp(url, siteConfig, MDContent)
  const appHtml = renderToString(
    <CacheProvider value={cache}>
      <App />
    </CacheProvider>
  )

  const chunks = extractCriticalToChunks(appHtml)
  const styles = constructStyleTagsFromChunks(chunks)

  const html = `<html lang="en" dir="ltr">
  <head>
    <meta char-set="UTF-8" />
    <link rel="icon" type="${siteConfig.icon.type}" href="${siteConfig.icon.href}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${siteConfig.title.value}</title>
    ${head.join("")}
    ${styles}
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
    <script type="text/json" id="_docs-meta">"${contentPath}"</script>
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
