import { defineAlbumConfig } from "@albumjs/album/config"
import react from "@albumjs/plugin-react"

export default defineAlbumConfig({
  plugins: [react()],
  vite: {
    build: {
      minify: false
    }
  },
  app: [
    {
      id: "home",
      module: {
        path: "src/modules/home",
        name: "modules"
      },
      ssrRender: { sendMode: "string" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "error",
      module: {
        path: "src/modules/error",
        name: "modules"
      },
      ssrRender: { sendMode: "pipe" },
      mainSSR: "src/main.ssr"
    },
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
      id: "nest1",
      module: {
        path: "src/modules/nest1",
        name: "modules"
      },
      ssrRender: { sendMode: "pipe" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "nest2",
      module: {
        path: "src/modules/nest2",
        name: "modules"
      },
      ssrRender: { sendMode: "pipe" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "nest3",
      module: {
        path: "src/modules/nest3",
        name: "modules"
      },
      ssrRender: { sendMode: "pipe" },
      mainSSR: "src/main.ssr"
    },
    {
      id: "nest4",
      module: {
        path: "src/modules/nest4",
        name: "modules"
      },
      ssrRender: { sendMode: "pipe" },
      mainSSR: "src/main.ssr"
    }
  ],
  server: {
    port: 5421
  },
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
