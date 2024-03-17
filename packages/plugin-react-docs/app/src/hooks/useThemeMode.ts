import { useState } from "react"

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState("dark")

  return { themeMode, setThemeMode }
}
