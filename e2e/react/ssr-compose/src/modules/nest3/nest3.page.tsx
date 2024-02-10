import { createRemoteAppLoader } from "albumjs"

const LocalAppLoader = createRemoteAppLoader({
  remote: true,
  url: "http://localhost:5421"
})

export default function Page() {
  return (
    <>
      <h1 id="nest3">page nest3</h1>
      <LocalAppLoader sourcePath="nest4/nest4.page.tsx" />
    </>
  )
}
