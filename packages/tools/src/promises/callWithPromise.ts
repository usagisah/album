import { Func } from "../types/types.js"

export function callWithPromise(fn: Func, params: any[], self: any) {
  return new Promise((resolve, reject) => {
    fn.apply(
      self,
      params.concat((err: any, data: any) => {
        err ? reject(err) : resolve(data)
      })
    )
  })
}
