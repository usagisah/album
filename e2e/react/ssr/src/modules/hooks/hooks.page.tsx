import { useServer, useServerData, useServerRouteData } from "albumjs"

export default function Page() {
  useServer(async () => {
    process.cwd()
  })

  const routeData = useServerRouteData()
  const serverData = useServerData("hooks", async props => {
    return { hooksPage: "from hooks page" }
  })

  return <>
    <h1 id="hooks">hooks page</h1>
    <div id="useServerRouteData">{JSON.stringify(routeData)}</div>
    <div id="useServerData">{JSON.stringify(serverData)}</div>
  </>
}