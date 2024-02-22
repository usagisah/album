import { defineAlbumConfig } from "@albumjs/album/config"
import react from "@albumjs/plugin-react"

export default defineAlbumConfig({
  plugins: [react()],
  server: {
    port: 5311
  }
})
