import { SSRProps, useRouter } from "@w-hite/album"

export default function aboutAction(props: SSRProps) {
  console.log("about page action", Object.keys(props))
  return { a: 1 }
}
