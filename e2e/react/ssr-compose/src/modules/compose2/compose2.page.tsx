import { createRemoteAppLoader } from "@w-hite/album"
import { Suspense, lazy } from "react"
import "./style.css"

const RemoteAppLoad = createRemoteAppLoader({
  remote: true,
  url: "http://localhost:5173"
})
const LazyComponent = lazy(() => import("./aa"))

export default function Compose2Page() {
  return (
    <>
      <h1>page compose2</h1>
      <Suspense>
        <LazyComponent />
      </Suspense>
      <RemoteAppLoad sourcePath="compose3/page/3" />
    </>
  )
}
