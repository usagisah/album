import { useLoader, useRouter } from "@w-hite/album"


export default function Page() {
  const [stage, value] = useLoader()
  console.log( "order page useLoader", stage, value )
  console.log( "order page useRouter", !!useRouter() )
  return <h1>page order</h1>
}
