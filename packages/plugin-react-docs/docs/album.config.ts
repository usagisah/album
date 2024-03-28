import { defineAlbumConfig } from "@albumjs/album/config"
import Docs, { AlbumDocsConfig } from "../dist/plugin.js"

export default defineAlbumConfig<AlbumDocsConfig>({
  plugins: [
    Docs({
      docs: {
        title: "AlbumPress",
        description: "",
        icon: "",
        logo: "https://vitepress.dev/vitepress-logo-mini.svg",
        navList: [
          { label: "指东", link: "/" },
          { label: "扭矩", link: "/" },
          { label: "你他丫的", link: "/" },
          {
            label: "下拉列表",
            link: "/",
            children: [
              { label: "1", link: "/1" },
              { label: "2", link: "/2", children: [{ label: "#", link: "/#" }] }
            ]
          }
        ],
        sidebar: [
          {
            label: "简介",
            children: [
              { label: "什么是 VitePress？", link: "what-is-vitepress" },
              { label: "快速开始", link: "getting-started" },
              { label: "路由", link: "routing" },
              { label: "部署", link: "deploy", children: [{ label: "部署", link: "deploy" }] }
            ]
          },
          {
            label: "写作",
            children: [
              { label: "Markdown 扩展", link: "markdown" },
              { label: "资源处理", link: "asset-handling" },
              { label: "frontmatter", link: "frontmatter" },
              { label: "在 Markdown 使用 Vue", link: "using-vue" },
              { label: "国际化", link: "i18n" }
            ]
          },
          {
            label: "自定义",
            children: [
              { label: "自定义主题", link: "custom-theme" },
              { label: "扩展默认主题", link: "extending-default-theme" },
              { label: "构建时数据加载", link: "data-loading" },
              { label: "SSR 兼容性", link: "ssr-compat" },
              { label: "连接 CMS", link: "cms" }
            ]
          },
          {
            label: "实验性功能",
            children: [
              { label: "MPA 模式", link: "mpa-mode" },
              { label: "sitemap 生成", link: "sitemap-generation" }
            ]
          },
          { label: "配置和 API 参考", link: "site-config" }
        ],
        footer: {
          message: "基于 MIT 许可发布",
          copyright: "版权所有 © 2019-2024 尤雨溪"
        },
        lang: {
          select: [
            { label: "English", link: "/e" },
            { label: "中文", link: "/c" }
          ]
        }
      }
    })
  ]
})
