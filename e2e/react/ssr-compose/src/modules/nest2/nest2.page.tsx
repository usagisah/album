import { createRemoteAppLoader } from "albumjs"

const LocalAppLoader = createRemoteAppLoader({
  remote: false,
  url: "localhost"
})

export default function Page() {
  return (
    <>
      <h1 id="nest2">page nest2</h1>
      <LocalAppLoader sourcePath="nest3/nest3.page.tsx" />
    </>
  )
}
