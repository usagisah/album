export async function callPluginWithCatch<T>(
  plugins: any[],
  props: T,
  onError: (e: any) => any
) {
  try {
    for (const pg of plugins) {
      await pg(props)
    }
  } catch (e) {
    await onError(e)
  }
  return props
}
