import { ServerRoute } from "../plugin.type.js"

export function buildRoutesSSRParams(serverRoutes: ServerRoute[], redirect: Record<string, string>) {
  const serverRoutesArray = serverRoutes.map(route => {
    const { name, reg, actionPath, fullPath } = route
    return (
      "{" +
      [
        `name: "${name}"`,
        `reg: ${reg}`,
        `fullPath: "${fullPath}"`,
        `actionPath: ${actionPath ? `"${actionPath}"` : null}`,
        `actionFactory: ${actionPath ? `() => import("${actionPath}")` : null}`
      ].join(",") +
      "}"
    )
  })
  const redirectRoutes = Object.keys(redirect).map(from => {
    return `{from:"${from}", to:"${redirect[from]}"}`
  })
  return {
    serverRoutes: serverRoutesArray.join(",\n"),
    redirectRoutes: redirectRoutes.join(",\n")
  }
}
