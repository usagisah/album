import { LocalData } from "albumjs"

export default {
  loader: async (data: LocalData) => {
    if (!data) throw "module loader data is not exist"
    return new Promise((resolve, reject) => {
      resolve(9)
    })
  },
  message: "routerHook page router"
}
