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
            footer: {
              message: "基于 MIT 许可发布",
              copyright: "版权所有 © 2019-2024 尤雨溪"
            },
            layout: "Home",
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
