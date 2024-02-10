import react from "@albumjs/plugin-react"
import { defineConfig } from "albumjs/config"

export default defineConfig({
  plugins: [react()],
  vite: {
    build: {
      minify: false
    }
  },
  app: [
    {
      id: "local1",
      module: {
        path: "src/modules/local1",
        name: "modules"
      },
      ssrRender: { sendMode: "string" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "local2",
      module: {
        path: "src/modules/local2",
        name: "modules"
      },
      ssrRender: { sendMode: "string" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "local3",
      module: {
        path: "src/modules/local3",
        name: "modules"
      },
      ssrRender: { sendMode: "string" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "remote1",
      module: {
        path: "src/modules/remote1",
        name: "modules"
      },
      ssrRender: { sendMode: "pipe" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "remote2",
      module: {
        path: "src/modules/remote2",
        name: "modules"
      },
      ssrRender: { sendMode: "pipe" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "remote3",
      module: {
        path: "src/modules/remote3",
        name: "modules"
      },
      ssrRender: { sendMode: "pipe" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "home",
      module: {
        path: "src/modules/home",
        name: "modules"
      },
      mainSSR: "src/main.ssr"
    }
  ],
  ssrCompose: {
    // <RemoteAppLoad sourcePath="compose3/page/3" />
    // rewrites: [
    //   {
    //     encode: s => {
    //       if (s.startsWith("compose") && s.endsWith(".page.tsx")) {
    //         const p = s.split("/")[0]
    //         return `${p}/page/${p.slice(-1)}`
    //       }
    //       return s
    //     },
    //     decode: v => {
    //       const [p, flag] = v.split("/")
    //       if (flag === "page") return `${p}/${p}.page.tsx`
    //       return v
    //     }
    //   }
    // ],
    // startRoot: "dist"
  }
})
