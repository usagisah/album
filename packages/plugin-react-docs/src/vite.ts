import react from "@vitejs/plugin-react-swc"
import { readFile, writeFile } from "fs/promises"
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
      if (id.endsWith(".md")) {
        const content = await parseMdToReact(code, parseMDConfig)
        return `export default function MarkdownComp(){ return <div className="md">${content}</div> }`
      }
    },

    configureServer(_server) {
      server = _server
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== "GET") {
          return next()
        }

        const { records } = context
        let path = (req as any).path
        if (path.endsWith(".html")) {
          path = path.slice(0, -5)
        }
        const record = records.find(r => {
          if (!r.routePath) {
            return false
          }
          return r.routePath.test(path)
        })

        if (!record) {
          return next()
        }

        const { frontmatter, outPath } = record
        const { scripts, siteConfig } = context.docsConfig
        const { dumpInput } = context.albumContext.inputs
        const { viteServer } = context.albumContext.serverManager

        if (!record.ready) {
          record.ready = new Promise<void>(async success => {
            const { renderSSG } = await viteServer.ssrLoadModule(resolve(dumpInput, "plugin-react-docs/main.ssg.tsx"))
            const html = await renderSSG({ ...siteConfig, frontmatter: frontmatter.value }, scripts)
            await writeFile(outPath, "<!doctype html>" + html, "utf-8")
            success()
          })
        }

        await record.ready
        const html = await readFile(record.outPath, "utf-8")
        const useHtml = await viteServer.transformIndexHtml(req.originalUrl, html)
        return res.end(useHtml)
      })
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
