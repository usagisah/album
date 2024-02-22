import { createRemoteAppLoader } from "album"
import { Suspense } from "react"

const LocalAppLoader = createRemoteAppLoader({
  remote: true,
  url: "http://localhost:5421"
})

export default function Page() {
  return (
    <>
      <h1 id="remote1">page remote1</h1>
      <Suspense>
        <LocalAppLoader sourcePath="remote2/remote2.page.tsx" />
      </Suspense>
    </>
  )
}
