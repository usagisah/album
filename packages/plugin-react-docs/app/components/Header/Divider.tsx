import { useTheme } from "@emotion/react"

export function Divider() {
  const theme = useTheme()
  return <div style={{ margin: "0 1rem", width: "1px", height: "24px", background: theme.divider.default }}></div>
}
