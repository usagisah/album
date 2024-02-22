import { createRemoteAppLoader } from "album"
import { Suspense } from "react"

const LocalAppLoader = createRemoteAppLoader({
  remote: false,
  url: "localhost"
})

export default function Page() {
  return (
    <>
      <h1 id="nest2">page nest2</h1>
      <Suspense>
        <LocalAppLoader sourcePath="nest3/nest3.page.tsx" />
      </Suspense>
    </>
  )
}
