import { defineAlbumConfig } from "@albumjs/album/config"
import react from "@albumjs/plugin-react"

export default defineAlbumConfig({
  plugins: [react()],
  app: {
    router: {
      redirect: {
        redirect: ""
      }
    }
  },
  server: {
    port: 5311
  }
})
