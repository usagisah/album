import { SiteConfig } from "@docs/site-config"
import { readFile } from "fs/promises"
import { dirname, join } from "path"
import { renderToString } from "react-dom/server"
import { fileURLToPath } from "url"
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

const __dirname = dirname(fileURLToPath(import.meta.url))
export async function ssgRender({ siteConfig, entryPath, importPath, contentPath, scripts }: SSGRenderOption) {
  const [css1, css2, { default: MDContent }] = await Promise.all([
    readFile(join(__dirname, "./normalize.css")),
    readFile(join(__dirname, "./docs.css")),
    import(/*@vite-ignore*/ importPath)
  ])
  siteConfig.frontmatter = MDContent.frontmatter
  const App = await createApp(siteConfig, MDContent)
  const stylePlaceholder = "__$_" + Date.now()
  const HTML = () => {
    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{siteConfig.title}</title>
          <style data-type="normalize.css" dangerouslySetInnerHTML={{ __html: css1 }}></style>
          <style data-type="docs.css" dangerouslySetInnerHTML={{ __html: css2 }}></style>
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
