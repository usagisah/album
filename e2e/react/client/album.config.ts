import { defineConfig } from "albumjs/config"
import react from "@albumjs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5211,
  },
  env: [{ common: { a: "config-common-a" }, development: { b: "config-dev-b" } }, "dev.env"]
})
