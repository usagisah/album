import { Suspense, lazy } from "react"
import "./style.css"

const LazyComponent = lazy(() => import("./lazy"))

export default function Compose3Page() {
  return (
    <>
      <h1 id="local3">page local3</h1>
      <Suspense>
        <LazyComponent />
      </Suspense>
    </>
  )
}
