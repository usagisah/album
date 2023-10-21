export async function PromiseAll<T extends readonly unknown[] | []>(promises: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  const res = await Promise.allSettled(promises)
  const values: any = []
  const errors: any = []
  for (const item of res) {
    item.status === "fulfilled" ? values.push(item.value) : errors.push(item.reason)
  }
  if (errors.length > 0) {
    throw errors
  }
  return values
}
