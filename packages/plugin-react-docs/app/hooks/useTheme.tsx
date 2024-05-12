import { usePage } from "album.docs"
import { useEffect, useState } from "react"
import { Select } from "../components/Select/Select"
import { DARK, LIGHT } from "../theme"

const SITE_THEME_MODE = "_site-theme-mode"
const INVALIDATE_ERROR = "setThemeMode: invalidate action. Not has the theme-mode"
const THEME_LIST = ["light", "dark", "system"]

function ThemeAction() {
  const { theme } = usePage()
  const { setThemeMode, list } = theme
  const items = list.map(item => {
    return {
      link: item,
      label: <span onClick={() => setThemeMode(item)}>{item}</span>
    }
  })
  return (
    <Select linkItems={items}>
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4210">
        <path
          d="M512 96C229.696 96 0 325.696 0 608c0 90.368 30.304 174.496 85.344 236.896 55.264 62.624 129.152 97.12 208.128 97.12 81.568 0 161.536-36.832 231.264-106.592l2.272-2.496c65.792-81.472 132.896-121.056 205.088-121.056 46.72 0 89.216 15.872 126.688 29.92 30.336 11.328 56.576 21.12 81.216 21.12C1024 762.912 1024 654.336 1024 608c0-282.304-229.696-512-512-512z m428 602.912c-13.088 0-35.296-8.288-58.784-17.088-40.48-15.136-90.848-33.952-149.12-33.952-92.352 0-175.328 46.944-253.76 143.456-57.184 56.704-121.056 86.688-184.832 86.688-60.352 0-117.216-26.784-160.128-75.456C88.64 751.872 64 682.784 64 608 64 360.96 264.96 160 512 160s448 200.96 448 448c0 27.328-1.952 90.912-20 90.912z m-203.296-182.848a64 64 0 1 0 128 0 64 64 0 1 0-128 0z m-343.68-202.688a64 64 0 1 0 128 0 64 64 0 1 0-128 0z m215.68 26.688a64 64 0 1 0 128 0 64 64 0 1 0-128 0z m-381.312 112a64 64 0 1 0 128 0 64 64 0 1 0-128 0zM182.4 698.752a96 96 0 1 0 192 0 96 96 0 1 0-192 0z"
          p-id="4211"
        ></path>
      </svg>
    </Select>
  )
}

function resolveSystemTheme(e?: MediaQueryList | MediaQueryListEvent) {
  if (!e) {
    e = matchMedia("(prefers-color-scheme: light)")
  }
  return e.matches ? "light" : "dark"
}

export function useTheme() {
  let themeMode = globalThis.localStorage?.getItem("_site-theme-mode") ?? "light"
  let currentTheme = themeMode === "system" ? resolveSystemTheme() : themeMode
  const [style, setStyle] = useState(currentTheme === "light" ? LIGHT : DARK)
  const [_, flush] = useState(Math.random())

  const setThemeMode = (mode: string) => {
    if (!THEME_LIST.includes(mode)) {
      return console.error(INVALIDATE_ERROR)
    }
    themeMode = mode
    localStorage.setItem(SITE_THEME_MODE, mode)
    setCurrentTheme()
  }

  const setCurrentTheme = (v?: string) => {
    const cur = v ?? (themeMode === "system" ? resolveSystemTheme() : themeMode)
    if (cur !== currentTheme) {
      document.documentElement.classList.replace(currentTheme, cur)
      currentTheme = cur
      return setStyle(currentTheme === "light" ? LIGHT : DARK)
    }
    flush(Math.random())
  }

  useEffect(() => {
    const handle = (e: MediaQueryListEvent) => {
      if (themeMode === "system") {
        setCurrentTheme(resolveSystemTheme(e))
      }
    }
    const match = matchMedia("(prefers-color-scheme: light)")
    match.addEventListener("change", handle)
    localStorage.setItem(SITE_THEME_MODE, themeMode)
    return () => {
      match.removeEventListener("change", handle)
    }
  }, [])

  return {
    list: THEME_LIST,
    get style() {
      return style
    },
    get currentTheme() {
      return currentTheme
    },
    get themeMode() {
      return themeMode
    },
    setThemeMode,
    ThemeAction: ThemeAction
  }
}
