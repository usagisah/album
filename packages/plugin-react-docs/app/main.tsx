import siteConfig from "@docs/site-config"
import { createRoot, hydrateRoot } from "react-dom/client"
import "./article.md.css"
import { createApp } from "./createApp"
import "./normalize.css"

if (typeof window !== "undefined") {
  siteConfig.frontmatter = JSON.parse(document.getElementById("frontmatter")!.textContent!)
}

async function createStaticApp() {debugger
  ;(globalThis as any).__ALBUM_DOCS__ = "react"
  const App = await createApp(siteConfig)
  return App
}

if (import.meta.env.PROD) {
  createStaticApp().then(App => hydrateRoot(document.getElementById("album-docs")!, <App />))
} else {
  createStaticApp().then(App => createRoot(document.getElementById("album-docs")!).render(<App />))
}
