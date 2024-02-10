import { createRemoteAppLoader } from "albumjs"

const LocalAppLoader = createRemoteAppLoader({
  remote: false,
  url: "localhost"
})

export default function Page() {
  return (
    <>
      <h1 id="local1">page local1</h1>
      <LocalAppLoader sourcePath="local2/local2.page.tsx" />
    </>
  )
}
