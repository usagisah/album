import { defineConfig } from "albumjs/config"
import react from "@albumjs/plugin-react"

export default defineConfig({
  plugins: [react()],
  env: [{ common: { a: "config-common-a" }, development: { b: "config-dev-b" } }, "dev.env"],
  server: {
    port: 5211,
  },
  app: {
    module: {
      ignore: ["ignore", /iIgnore/]
    }
  }
})
