import { useTheme } from "@emotion/react"
import { CSSProperties, useEffect, useState } from "react"
import { useScroll } from "../../hooks/useScroll"

export function useHeaderScroll() {
  const theme = useTheme()
  const glideStyle = { background: theme.bg.default, borderBottom: `1px solid ${theme.bg.default}` }
  const onScroll = () => {
    if (window.innerWidth < 1000) {
      return
    }

    if (window.scrollY <= 60) {
      setStyle({})
      return
    }

    setStyle(glideStyle)
  }
  useScroll(onScroll)
  useEffect(() => {
    onScroll()
  }, [theme])
  const [style, setStyle] = useState<CSSProperties>({})
  return style
}
