import { useLoader, useRouter, useRoutes, useRoutesMap } from "albumjs"

export default function Page() {
  const loader = useLoader()
  const routesList = useRoutes()
  const routerMap = useRoutesMap()
  const router = useRouter()
  return (
    <>
      <h1 id="routerHook">page routerHook</h1>
      <div id="useLoader">{JSON.stringify(loader)}</div>
      <div id="useRouter">{JSON.stringify({ query: router.query, meta: router.meta })}</div>
      <div id="useRoutes">{routesList.length}</div>
      <div id="useRoutesMap">{routerMap.size}</div>
    </>
  )
}
