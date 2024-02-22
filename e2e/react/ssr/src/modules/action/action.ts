import { SSRProps } from "album"

export default function action(props: SSRProps) {
  return { action: "from page action" }
}
