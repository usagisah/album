import { SiteConfig } from "@docs/site-config"
import { renderToString } from "react-dom/server"
import { createApp } from "./createApp"

interface SSGRenderOption {
  siteConfig: SiteConfig
  scripts: any[]
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

export async function ssgRender({ siteConfig, entryPath, importPath, contentPath, scripts }: SSGRenderOption) {
  const { default: MDContent } = await import(/*@vite-ignore*/ importPath)
  siteConfig.frontmatter = MDContent.frontmatter
  const App = await createApp(siteConfig, MDContent)
  const stylePlaceholder = "__$_" + Date.now()
  const HTML = () => {
    return (
      <html lang="en" dir="ltr">
        <head>
          <meta charSet="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{siteConfig.title}</title>
          {stylePlaceholder}
        </head>
        <body>
          <div id="album-docs">
            <App />
          </div>
          <script type="text/json" id="_docs-meta" dangerouslySetInnerHTML={{ __html: JSON.stringify({ contentPath }) }}></script>
          <script type="module" src={entryPath}></script>
        </body>
      </html>
    )
  }
  const html = renderToString(
    <CacheProvider value={cache}>
      <HTML />
    </CacheProvider>
  )
  const chunks = extractCriticalToChunks(html)
  const styles = constructStyleTagsFromChunks(chunks)
  return html.replace(stylePlaceholder, styles)
}
