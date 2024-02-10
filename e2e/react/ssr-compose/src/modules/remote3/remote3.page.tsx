import { Suspense, lazy } from "react"
import "./style.css"

const LazyComponent = lazy(() => import("./lazy"))

export default function Page() {
  return (
    <>
      <h1 id="remote3">page remote3</h1>
      <Suspense>
        <LazyComponent />
      </Suspense>
    </>
  )
}
