import react from "@albumjs/plugin-react"
import { defineConfig } from "albumjs/config"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5411
  }
})
