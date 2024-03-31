import { siteConfig } from "@docs/site-config"
import { createRoot, hydrateRoot } from "react-dom/client"
import { createApp } from "./createApp"
import "./docs.css"

async function createStaticApp() {
  ;(globalThis as any).__ALBUM_DOCS__ = "react"
  const meta = JSON.parse(document.getElementById("_docs-meta")!.textContent!)
  const { default: MDContent } = await import(/*@vite-ignore*/ meta)
  siteConfig.frontmatter = MDContent.frontmatter
  const App = await createApp("", siteConfig, MDContent)
  return App
}

if (typeof window !== "undefined") {
  if (import.meta.env.PROD) {
    createStaticApp().then(App => hydrateRoot(document.getElementById("album-docs")!, <App />))
  } else {
    createStaticApp().then(App => createRoot(document.getElementById("album-docs")!).render(<App />))
  }
}
