import "@emotion/react"
declare module "@emotion/react" {
  export interface Theme {
    white: string
    black: string
    text: {
      1: string
      2: string
      3: string
    }
    border: {
      default: string
    }
    divider: {
      default: string
    }
    gray: {
      1: string
      2: string
      3: string
      bg: string
      block: string
    }
    primary: {
      default: string
      hover: string
      bg: string
    }
    radius: {
      small: string
      default: string
      large: string
      btn: string
      max: string
    }
  }
}
