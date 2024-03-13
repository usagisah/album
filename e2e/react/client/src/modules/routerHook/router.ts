import { RouterLocation } from "album"

export default {
  loader: async (data: RouterLocation) => {
    if (!data) throw "module loader data is not exist"
    return new Promise((resolve, reject) => {
      resolve(9)
    })
  },
  message: "routerHook page router"
}
