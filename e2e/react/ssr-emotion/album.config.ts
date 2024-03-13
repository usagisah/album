import { defineAlbumConfig } from "@albumjs/album/config"
import react from "@albumjs/plugin-react"

export default defineAlbumConfig({
  plugins: [
    react({
      pluginReact: {
        jsxImportSource: "@emotion/react"
      }
    })
  ],
  server: {
    port: 5430
  }
})
