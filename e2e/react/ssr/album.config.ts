import { defineConfig } from "albumjs/config"
import react from "@albumjs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5311,
  }
})
