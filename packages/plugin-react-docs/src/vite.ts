import react from "@vitejs/plugin-react-swc"
import { resolve } from "path"
import { Plugin, ViteDevServer, mergeConfig } from "vite"
import { SITE_CONFIG, SITE_THEME } from "./constants.js"
import { PluginContext } from "./docs.type.js"
import { parseMdToReact } from "./parser/parseMdToReact.js"
export { ParseMDConfig } from "./parser/parseMdToReact.js"

export default function AlbumReactDocsVitePlugin(context: PluginContext) {
  const { docsConfig, reactConfig, parseMDConfig, albumContext } = context
  const { inputs } = albumContext
  const transform = async (code: string, id: string) => {
    if (id.endsWith(".md")) {
      const { importers, frontmatter, content } = await parseMdToReact(code, parseMDConfig)
      return [
        ...importers,
        `export default function MarkdownComp(){ return <div className="md">${content}</div> }`,
        `const frontmatter=${JSON.stringify(frontmatter)}`,
        `MarkdownComp.frontmatter = frontmatter`
      ].join("\n")
    }
  }

  let server: ViteDevServer

  const plugin: Plugin = {
    name: "album:react-docs",

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
    },

    async transform(code, id) {
      return transform(code, id)
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
        const { renderSSG } = await viteServer.ssrLoadModule(resolve(dumpInput, "plugin-react-docs/main.ssg.tsx"))
        let html = await renderSSG({ siteConfig, scripts, contentPath: filepath, clientPath: resolve(dumpInput, "plugin-react-docs/main.tsx") })
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
