import { Suspense, lazy } from "react"
import "./style.css"
import { createRemoteAppLoader } from "@w-hite/album"

const LocalAppLoader = createRemoteAppLoader({
  remote: false,
  url: "localhost"
})
const LazyComponent = lazy(() => import("./aa"))

export default function Compose3Page() {
  return (
    <>
      <h1>page compose3+++\\\</h1>
      <Suspense>
        <LazyComponent />
      </Suspense>
      <LocalAppLoader sourcePath="compose4/page/4" />
    </>
  )
}
