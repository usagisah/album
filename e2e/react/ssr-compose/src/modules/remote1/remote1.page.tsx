import { createRemoteAppLoader } from "albumjs"

const LocalAppLoader = createRemoteAppLoader({
  remote: true,
  url: "http://localhost:5173"
})

export default function Page() {
  return (
    <>
      <h1 id="remote1">page remote1</h1>
      <LocalAppLoader sourcePath="remote2/remote2.page.tsx" />
    </>
  )
}
