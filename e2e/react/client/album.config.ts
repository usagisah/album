import react from "@albumjs/plugin-react"
import { defineConfig } from "albumjs/config"

export default defineConfig({
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
