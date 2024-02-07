import { createRemoteAppLoader } from "@w-hite/album"

const LocalAppLoader = createRemoteAppLoader({
  remote: false,
  url: "localhost"
})

export default function Compose1Page() {
  return (
    <div>
      <h1>compose1 page</h1>
      <LocalAppLoader sourcePath="compose2/page/2" />
    </div>
  )
}
