import { defineConfig } from "albumjs/config"
import react from "@albumjs/plugin-react"

export default defineConfig({
  plugins: [react()],
  vite: {
    build: {
      minify: false
    }
  },
  env: [{ common: { a: "1" }, development: { b: "2" } }, "dev.env"]
})
