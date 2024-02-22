import { defineAlbumConfig } from "@albumjs/album/config"
import react from "@albumjs/plugin-react"

export default defineAlbumConfig({
  plugins: [react()],
  env: [{ common: { a: "config-common-a" }, production: { b: "config-dev-b" }, development: { b: "config-dev-b" } }, "env"],
  server: {
    port: 5211
  },
  app: {
    module: {
      ignore: ["ignore", /iIgnore/]
    }
  }
})
