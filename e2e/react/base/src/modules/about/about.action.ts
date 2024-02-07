import { SSRProps, useRouter } from "albumjs"

export default function aboutAction(props: SSRProps) {
  console.log("about page action", Object.keys(props))
  return { a: 1 }
}
