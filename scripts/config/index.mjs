export const pkgBuild = {
  album: {
    bundler: "esbuild:decorator",
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
  all: ["album", "cli", "tools", "plugin-react"],
  react: ["album", "cli", "tools", "plugin-react"]
}
