const capitalReg = /[A-Z]/g
export function camelToUnderscore(str: string): string {
  return str.replace(capitalReg, v => {
    return `_${v.toLowerCase()}`
  })
}

const camelReg = /_([a-zA-Z])/g
export function underscoreToCamel(str: string): string {
  return str.replace(camelReg, (_, s: string) => {
    return s.toUpperCase()
  })
}
