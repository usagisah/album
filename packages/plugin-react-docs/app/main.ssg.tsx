import { SiteConfig } from "@docs/site-config"
import { readFile } from "fs/promises"
import { dirname, join } from "path"
import { renderToStaticNodeStream } from "react-dom/server"
import { Writable } from "stream"
import { fileURLToPath } from "url"
import { createApp } from "./createApp"

interface RenderSSGOption {
  siteConfig: SiteConfig
  scripts: any[]
  contentPath: string
  clientPath: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))
export function renderSSG({ siteConfig, clientPath, contentPath, scripts }: RenderSSGOption) {
  return new Promise(async send => {
    const [css1, css2, { default: MDContent }] = await Promise.all([
      readFile(join(__dirname, "./normalize.css")),
      readFile(join(__dirname, "./docs.css")),
      import(/*@vite-ignore*/ contentPath)
    ])
    siteConfig.frontmatter = MDContent.frontmatter
    const App = await createApp(siteConfig, MDContent)
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
          </head>
          <body>
            <div id="album-docs">
              <App />
            </div>
            <script type="text/json" id="_docs-meta" dangerouslySetInnerHTML={{ __html: JSON.stringify({ contentPath }) }}></script>
            <script type="module" src={clientPath}></script>
          </body>
        </html>
      )
    }
    let html = ""
    renderToStaticNodeStream(<HTML />).pipe(
      new Writable({
        write(chunk, encoding, callback) {
          html += chunk.toString()
          callback()
        },
        final(cb) {
          send(html)
          cb()
        }
      })
    )
  })
}
