import { useServerRouteData, useServerData, SSRProps } from "albumjs"

export default function Page() {
  console.log( "about-page useServerRouteData", useServerRouteData() )

  const data = useServerData("about", async (props: SSRProps) => {
    console.log( "about-page useServerData props", Object.keys(props) )
    return { b: 1 }
  })
  console.log( "about-page useServerData", data )

  return <h1>page about</h1>
}