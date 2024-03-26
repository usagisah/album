import { SiteConfig } from "@docs/site-config"
import { dirname, join } from "path"
import { renderToStaticNodeStream } from "react-dom/server"
import { Writable } from "stream"
import { fileURLToPath } from "url"
import { createApp } from "./createApp"

const __dirname = dirname(fileURLToPath(import.meta.url))
export function renderSSG(siteConfig: SiteConfig) {
  return new Promise(async send => {
    const App = await createApp(siteConfig)
    const HTML = () => {
      return (
        <html lang="en">
          <head>
            <meta charSet="UTF-8" />
            <link rel="icon" type="image/svg+xml" href="/vite.svg" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{siteConfig.title}</title>
          </head>
          <body>
            <div id="album-docs">
              <App />
            </div>
            <script type="text/json" id="frontmatter" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteConfig.frontmatter) }}></script>
            <script type="module" src={join(__dirname, "main.tsx")}></script>
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
