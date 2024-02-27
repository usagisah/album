export const pkgBuild = {
  album: {
    bundler: "tsc",
    entries: [{ name: "server" }, { name: "service" }, { name: "config" }, { name: "start" }, { name: "tools", options: {} }]
  },
  cli: {
    bundler: "esbuild",
    entries: [{ name: "cli" }]
  },
  "plugin-react": {
    bundler: "esbuild",
    entries: [{ name: "plugin" }]
  },
  tools: {
    bundler: "tsc",
    entries: []
  }
}

export const pkgPreset = {
  all: ["tools", "cli", "album", "plugin-react"],
  react: ["tools", "cli", "album", "plugin-react"]
}
