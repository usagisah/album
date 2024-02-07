import { defineConfig } from "@w-hite/album/config"
import react from "@w-hite/plugin-react"

export default defineConfig({
  plugins: [react()],
  vite: {
    build: {
      minify: false
    }
  },
  app: [
    {
      id: "compose1",
      module: {
        path: "src/modules/compose1",
        name: "modules"
      },
      ssrRender: { sendMode: "string" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "compose2",
      module: {
        path: "src/modules/compose2",
        name: "modules"
      },
      ssrRender: { sendMode: "string" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "compose3",
      module: {
        path: "src/modules/compose3",
        name: "modules"
      },
      ssrRender: { sendMode: "string" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "compose4",
      module: {
        path: "src/modules/compose4",
        name: "modules"
      },
      mainSSR: "src/main.ssr"
    }
    // {
    //   id: "home",
    //   module: {
    //     path: "src/modules/home",
    //     name: "modules"
    //   },
    //   mainSSR: "src/main.ssr"
    // }
  ],
  ssrCompose: {
    rewrites: [
      {
        encode: s => { 
          if (s.startsWith("compose") && s.endsWith(".page.tsx")) {
            const p = s.split("/")[0]
            return `${p}/page/${p.slice(-1)}`
          }
          return s
        },
        decode: v => {
          const [p, flag] = v.split("/")
          if (flag === "page") return `${p}/${p}.page.tsx`
          return v
        }
      }
    ],
    startRoot: "dist"
  },
  env: [{ common: { a: "1" }, development: { b: "2" } }, "dev.env"]
})
