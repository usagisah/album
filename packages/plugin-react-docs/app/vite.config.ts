import react from "@vitejs/plugin-react"
import { resolve } from "path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "album:docs",
      resolveId(id) {
        switch (id) {
          case "@docs/site-config":
          case "@docs/site-theme":
            return id
        }
      },
      load(id) {
        if (id === "@docs/site-config") {
          return `export default {
            title: "VitePress",
            description: "",
            icon: "",
            logo: "https://vitepress.dev/vitepress-logo-mini.svg",
            path: "/",
            navList: [
              { text: "指南", link: "/" },
              { text: "扭矩", link: "/" },
              { text: "你他丫的", link: "/" },
              { 
                text: "下拉列表", link: "/", items: [
                  { text: "1", link: "/1" },
                  { text: "2", link: "/2", items: [{text:"#", link:"/#"}] },
                ] 
              },
            ],
            navSearch: {

            },
            navActions: [
              
            ],
            sidebar: [
              {
                text: '简介',
                collapsed: false,
                items: [
                  { text: '什么是 VitePress？', link: 'what-is-vitepress' },
                  { text: '快速开始', link: 'getting-started' },
                  { text: '路由', link: 'routing' },
                  { text: '部署', link: 'deploy' }
                ]
              },
              {
                text: '写作',
                collapsed: false,
                items: [
                  { text: 'Markdown 扩展', link: 'markdown' },
                  { text: '资源处理', link: 'asset-handling' },
                  { text: 'frontmatter', link: 'frontmatter' },
                  { text: '在 Markdown 使用 Vue', link: 'using-vue' },
                  { text: '国际化', link: 'i18n' }
                ]
              },
              {
                text: '自定义',
                collapsed: false,
                items: [
                  { text: '自定义主题', link: 'custom-theme' },
                  { text: '扩展默认主题', link: 'extending-default-theme' },
                  { text: '构建时数据加载', link: 'data-loading' },
                  { text: 'SSR 兼容性', link: 'ssr-compat' },
                  { text: '连接 CMS', link: 'cms' }
                ]
              },
              {
                text: '实验性功能',
                collapsed: false,
                items: [
                  { text: 'MPA 模式', link: 'mpa-mode' },
                  { text: 'sitemap 生成', link: 'sitemap-generation' }
                ]
              },
              { text: '配置和 API 参考', base: '/zh/reference/', link: 'site-config' }
            ],
            footer: {
              message: "基于 MIT 许可发布",
              copyright: "版权所有 © 2019-2024 尤雨溪"
            },
            layout: "default",
            lang: [
              { text: "English", link: "/e" },
              { text: "中文", link: "/c" },
            ]
          }`
        } else if (id === "@docs/site-theme") {
          return `export default []`
        }
      }
    },
    react({
      jsxImportSource: "@emotion/react"
    })
  ],
  resolve: {
    alias: {
      "album.docs": resolve(process.cwd(), "./src/hooks/useAppContext.tsx")
    }
  }
})
