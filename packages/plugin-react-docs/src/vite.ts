import react from "@vitejs/plugin-react-swc"
import gm from "gray-matter"
import { resolve } from "path"
import { Plugin, ViteDevServer, mergeConfig } from "vite"
import { SITE_CONFIG, SITE_THEME } from "./constants.js"
import { PluginContext } from "./docs.type.js"
import { parseMdToReact } from "./parser/parseMdToReact.js"
export { ParseMDConfig } from "./parser/parseMdToReact.js"

export default function AlbumReactDocsVitePlugin(context: PluginContext) {
  const { docsConfig, reactConfig, parseMDConfig, albumContext } = context
  const { inputs } = albumContext

  let server: ViteDevServer

  const plugin: Plugin = {
    name: "album:react-docs",

    enforce: "pre",

    config(c) {
      return mergeConfig(c, {
        optimizeDeps: {
          include: ["react", "react-dom", "@emotion/react/jsx-dev-runtime", "@emotion/react", "@emotion/styled", "antd"]
        }
      })
    },

    resolveId(id) {
      switch (id) {
        case SITE_CONFIG:
        case SITE_THEME: {
          return id
        }
      }
    },

    load(id) {
      if (id === SITE_CONFIG) {
        return `export default ${JSON.stringify(docsConfig.siteConfig)}`
      } else if (id === SITE_THEME) {
        return docsConfig.resolveThemeFile(inputs.cwd)
      }

      if (albumContext.serverMode === "build" && id.endsWith("index.html")) {
        return ""
      }
    },

    async transform(code: string, id: string) {
      if (id.endsWith(".md")) {
        const { data, content } = gm(code)
        const { import: importers = [], export: exporters } = data
        const res = await parseMdToReact(content, parseMDConfig)
        let mdContent = [
          ...importers,
          `export default function MarkdownComp(){ return <div className="md">${res}</div> }`,
          `const frontmatter=${JSON.stringify(data)}`,
          `MarkdownComp.frontmatter = frontmatter`
        ].join("\n")
        return mdContent
      }
    },

    configureServer(_server) {
      server = _server
      server.middlewares.use(async (req, res, next) => {
        let path: string = (req as any).path
        if (req.method !== "GET") {
          return next()
        }

        const { routes } = context
        const route = routes.find(r => {
          if (!r.match) {
            return false
          }
          return r.match.test(path)
        })

        if (!route) {
          return next()
        }

        const { filepath } = route
        const { scripts, siteConfig } = context.docsConfig
        const { dumpInput } = context.albumContext.inputs
        const { viteServer } = context.albumContext.serverManager
        const { ssgRender } = await viteServer.ssrLoadModule(resolve(dumpInput, "plugin-react-docs/main.ssg.tsx"))
        let html = await ssgRender({
          entryPath: resolve(dumpInput, "plugin-react-docs/main.tsx"),
          importPath: filepath,
          contentPath: filepath,
          siteConfig,
          scripts
        })
        html = await viteServer.transformIndexHtml(req.originalUrl, html)
        return res.end(html)
      })
    },

    handleHotUpdate(ctx) {
      const { file, server } = ctx
      if (ctx.file.endsWith(".md")) {
        const { modulePath } = context.albumContext.appManager.module
        if (file.startsWith(modulePath)) {
          server.hot.send({ type: "full-reload" })
        }
      }
    }
  }

  return [
    plugin,
    ...react({
      ...reactConfig,
      plugins: [],
      parserConfig: id => {
        if (id.endsWith(".md") || id.endsWith(".tsx")) {
          return {
            syntax: "typescript",
            tsx: true
          }
        }
        if (id.endsWith(".ts")) {
          return {
            syntax: "typescript"
          }
        }
        return reactConfig?.parserConfig?.(id)
      },
      jsxImportSource: "@emotion/react"
    })
  ]
}
