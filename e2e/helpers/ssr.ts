const suspenseReg = /<!--\/?\$-->/g
const commentReg = /<!-- -->/g
export function replacePlaceholder(str: string) {
  return str.replace(suspenseReg, "").replace(commentReg, "")
}
