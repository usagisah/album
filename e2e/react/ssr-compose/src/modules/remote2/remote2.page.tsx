import { createRemoteAppLoader } from "album"
import { Suspense, lazy } from "react"
import "./style.css"

const LocalAppLoader = createRemoteAppLoader({
  remote: true,
  url: "http://localhost:5421"
})
const LazyComponent = lazy(() => import("./lazy"))

export default function Page() {
  return (
    <>
      <h1 id="remote2">page remote2</h1>
      <Suspense>
        <LazyComponent />
      </Suspense>
      <Suspense>
        <LocalAppLoader sourcePath="remote3/remote3.page.tsx" />
      </Suspense>
    </>
  )
}
