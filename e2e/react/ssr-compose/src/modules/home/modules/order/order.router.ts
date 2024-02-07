

export default {
  loader: async function loader() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(9)
      }, 4000)
    })
  }
}
