import "@emotion/react"
declare module "@emotion/react" {
  export interface Theme {
    white: string
    default: string
    reverse: string
    bg: {
      default: string
      content: string
      highlight: string
    }
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
      block: string
    }
    primary: {
      default: string
      hover: string
      bg: string
    }
    info: {
      color: string
      bg: string
    }
    tip: {
      color: string
      bg: string
    }
    warn: {
      color: string
      bg: string
    }
    danger: {
      color: string
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
