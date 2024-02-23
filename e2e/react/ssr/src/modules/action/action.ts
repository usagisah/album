import { SSRProps } from "album.server"

export default function action(props: SSRProps) {
  return { action: "from page action" }
}
