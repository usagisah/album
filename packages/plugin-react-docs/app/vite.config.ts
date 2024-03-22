import { defineConfig } from "vite"
import docs from "./plugin/plugin"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [docs()]
})
