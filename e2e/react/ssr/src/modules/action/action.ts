import { SSRProps } from "albumjs"

export default function action(props: SSRProps) {
  return { action: "from page action" }
}
