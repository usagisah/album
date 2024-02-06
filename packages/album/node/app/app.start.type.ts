export type AppManagerSSRRender = {
  sendMode: "pipe" | "string"
}

export type AppManager = {
  ssrRender: AppManagerSSRRender
}
