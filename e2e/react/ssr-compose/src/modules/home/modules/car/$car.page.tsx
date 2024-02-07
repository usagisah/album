import { useLoader, useRouter, useRoutes, useRoutesMap } from "@w-hite/album"

export default function Page() {
  if (import.meta.env.SSR) {
    console.log("car page", !!useRouter())
  } else {
    console.log("car page useLoader", useLoader())
    console.log(
      "car page useRouter(), useRoutes(), useRoutesMap()",
      !!useRouter(),
      !!useRoutes(),
      useRoutesMap().keys()
    )
  }
  return <h1>page car1111</h1>
}
