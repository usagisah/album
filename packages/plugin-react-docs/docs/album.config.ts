import { defineAlbumConfig } from "@albumjs/album/config"
import Docs, { AlbumDocsConfig } from "../dist/plugin.js"

export default defineAlbumConfig<AlbumDocsConfig>({
  plugins: [
    Docs({
      docs: {
        title: {},
        description: "由 AlbumPress 和 Album 驱动的静态站点生成器",
        navList: [
          { label: "API", link: "/api" },
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
            label: "测试 api",
            link: "/api"
          },
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
          locales: {
            en: {
              label: "English"
            }
          }
        },

        actions: [
          {
            icon: `<svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5345"
          >
            <path
              d="M511.542857 14.057143C228.914286 13.942857 0 242.742857 0 525.142857 0 748.457143 143.2 938.285714 342.628571 1008c26.857143 6.742857 22.742857-12.342857 22.742858-25.371429v-88.571428c-155.085714 18.171429-161.371429-84.457143-171.771429-101.6C172.571429 756.571429 122.857143 747.428571 137.714286 730.285714c35.314286-18.171429 71.314286 4.571429 113.028571 66.171429 30.171429 44.685714 89.028571 37.142857 118.857143 29.714286 6.514286-26.857143 20.457143-50.857143 39.657143-69.485715-160.685714-28.8-227.657143-126.857143-227.657143-243.428571 0-56.571429 18.628571-108.571429 55.2-150.514286-23.314286-69.142857 2.171429-128.342857 5.6-137.142857 66.4-5.942857 135.428571 47.542857 140.8 51.771429 37.714286-10.171429 80.8-15.542857 129.028571-15.542858 48.457143 0 91.657143 5.6 129.714286 15.885715 12.914286-9.828571 76.914286-55.771429 138.628572-50.171429 3.314286 8.8 28.228571 66.628571 6.285714 134.857143 37.028571 42.057143 55.885714 94.514286 55.885714 151.2 0 116.8-67.428571 214.971429-228.571428 243.314286a145.714286 145.714286 0 0 1 43.542857 104v128.571428c0.914286 10.285714 0 20.457143 17.142857 20.457143 202.4-68.228571 348.114286-259.428571 348.114286-484.685714 0-282.514286-229.028571-511.2-511.428572-511.2z"
              p-id="5346"
            ></path>
          </svg>`,
            link: "https://github.com"
          }
        ],
        search: {}
      }
    })
  ]
})
