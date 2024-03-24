import react from "@vitejs/plugin-react-swc"
import { Plugin, ViteDevServer } from "vite"
import { SITE_CONFIG, SITE_THEME } from "./constants.js"
import { PluginContext } from "./docs.type.js"
import { parseMdToReact } from "./parser/parseMdToReact.js"
export { ParseMDConfig } from "./parser/parseMdToReact.js"

export default function AlbumReactDocsVitePlugin(context: PluginContext) {
  const { reactConfig, parseMDConfig } = context
  const markdownRecord: Record<string, any> = {}
  const usedId = new Set<string>()

  let server: ViteDevServer
  let id: any = null
  const hotUpdate = () => {
    if (!server) {
      return
    }
    if (id) {
      clearTimeout(id)
    }
    id = setTimeout(() => {
      usedId.forEach(id => {
        const mod = server.moduleGraph.getModuleById(id)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
        }
      })
      server.moduleGraph.invalidateModule(server.moduleGraph.getModuleById(SITE_CONFIG)!)
      server.hot.send({ type: "full-reload" })
      id = null
    }, 1000)
  }

  const plugin: Plugin = {
    name: "album:react-docs",

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
        const frontmatter = JSON.stringify(markdownRecord)
        return `export default {
          title: "VitePress",
          description: "",
          icon: "",
          logo: "https://vitepress.dev/vitepress-logo-mini.svg",
          path: "/",
          frontmatter: ${frontmatter},
          navList: [
            { label: "指南", link: "/" },
            { label: "扭矩", link: "/" },
            { label: "你他丫的", link: "/" },
            { 
              label: "下拉列表", link: "/", children: [
                { label: "1", link: "/1" },
                { label: "2", link: "/2", children: [{label:"#", link:"/#"}] },
              ] 
            },
          ],
          navSearch: {

          },
          navActions: [
            
          ],
          sidebar: [
            {
              label: '简介',
              children: [
                { label: '什么是 VitePress？', link: 'what-is-vitepress' },
                { label: '快速开始', link: 'getting-started' },
                { label: '路由', link: 'routing' },
                { label: '部署', link: 'deploy', children: [{ label: '部署', link: 'deploy' }] }
              ]
            },
            {
              label: '写作',
              children: [
                { label: 'Markdown 扩展', link: 'markdown' },
                { label: '资源处理', link: 'asset-handling' },
                { label: 'frontmatter', link: 'frontmatter' },
                { label: '在 Markdown 使用 Vue', link: 'using-vue' },
                { label: '国际化', link: 'i18n' }
              ]
            },
            {
              label: '自定义',
              children: [
                { label: '自定义主题', link: 'custom-theme' },
                { label: '扩展默认主题', link: 'extending-default-theme' },
                { label: '构建时数据加载', link: 'data-loading' },
                { label: 'SSR 兼容性', link: 'ssr-compat' },
                { label: '连接 CMS', link: 'cms' }
              ]
            },
            {
              label: '实验性功能',
              children: [
                { label: 'MPA 模式', link: 'mpa-mode' },
                { label: 'sitemap 生成', link: 'sitemap-generation' }
              ]
            },
            { label: '配置和 API 参考', base: '/zh/reference/', link: 'site-config' }
          ],
          footer: {
            message: "基于 MIT 许可发布",
            copyright: "版权所有 © 2019-2024 尤雨溪"
          },
          layout: "default",
          lang: [
            { label: "English", link: "/e" },
            { label: "中文", link: "/c" },
          ]
        }`
      } else if (id === SITE_THEME) {
        return `export default []`
      }
    },

    async transform(code, id) {
      if (code.includes(`import siteConfig from "@docs/site-config"`)) {
        usedId.add(id)
      }
      if (id.endsWith(".md")) {
        const res = await parseMdToReact(code, parseMDConfig)
        markdownRecord[id] = { frontmatter: res.frontmatter }
        debugger
        hotUpdate()
        return `export default function MarkdownComp(){ return <div className="md">${res.html}</div> }`
      }
    },

    configureServer(_server) {
      server = _server
      server.middlewares.use((req, res, next) => {
        debugger
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
