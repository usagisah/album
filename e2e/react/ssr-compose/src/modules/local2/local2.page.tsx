import { createRemoteAppLoader } from "album"
import { Suspense, lazy } from "react"
import "./style.css"

const LocalAppLoader = createRemoteAppLoader({
  remote: false,
  url: "localhost"
})
const LazyComponent = lazy(() => import("./lazy"))

export default function Page() {
  return (
    <>
      <h1 id="local2">page local2</h1>
      <Suspense>
        <LazyComponent />
      </Suspense>
      <LocalAppLoader sourcePath="local3/local3.page.tsx" />
    </>
  )
}
