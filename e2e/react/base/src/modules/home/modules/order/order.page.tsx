import { useLoader, useRouter } from "albumjs"


export default function Page() {
  const [stage, value] = useLoader()
  console.log( "order page useLoader", stage, value )
  console.log( "order page useRouter", !!useRouter() )
  return <h1>page order</h1>
}
