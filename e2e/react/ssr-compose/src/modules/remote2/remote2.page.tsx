import { createRemoteAppLoader } from "albumjs"
import { Suspense, lazy } from "react"
import "./style.css"

const LocalAppLoader = createRemoteAppLoader({
  remote: true,
  url: "http://localhost:5173"
})
const LazyComponent = lazy(() => import("./lazy"))

export default function Page() {
  return (
    <>
      <h1 id="remote2">page remote2</h1>
      <Suspense>
        <LazyComponent />
      </Suspense>
      <LocalAppLoader sourcePath="remote3/remote3.page.tsx" />
    </>
  )
}
