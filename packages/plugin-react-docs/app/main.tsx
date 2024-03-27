import siteConfig from "@docs/site-config"
import { createRoot, hydrateRoot } from "react-dom/client"
import { createApp } from "./createApp"

async function createStaticApp() {
  ;(globalThis as any).__ALBUM_DOCS__ = "react"
  const meta = JSON.parse(document.getElementById("_docs-meta")!.textContent!)
  const { default: MDContent } = await import(/*@vite-ignore*/ meta.contentPath)
  siteConfig.frontmatter = MDContent.frontmatter
  const App = await createApp(siteConfig, MDContent)
  return App
}

if (import.meta.env.PROD) {
  createStaticApp().then(App => hydrateRoot(document.getElementById("album-docs")!, <App />))
} else {
  createStaticApp().then(App => createRoot(document.getElementById("album-docs")!).render(<App />))
}
