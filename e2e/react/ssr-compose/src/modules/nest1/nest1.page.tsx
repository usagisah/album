import { createRemoteAppLoader } from "albumjs"

const LocalAppLoader = createRemoteAppLoader({
  remote: true,
  url: "http://localhost:5421"
})

export default function Page() {
  return (
    <>
      <h1 id="nest1">page nest1</h1>
      <LocalAppLoader sourcePath="nest2/nest2.page.tsx" />
    </>
  )
}
