import { resolve } from "path"
import { defineConfig } from "vitest/config"
import { E2E_TIMEOUT } from "./helpers/puppeteer"

export default defineConfig({
  test: {
    include: ["./**/*.spec.ts"],
    globals: true,
    testTimeout: E2E_TIMEOUT,
    hookTimeout: E2E_TIMEOUT,
    restoreMocks: true,
    globalSetup: [resolve(__dirname, "setup.global.ts")],
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
})
