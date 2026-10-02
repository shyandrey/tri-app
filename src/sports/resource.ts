/** Shared in-flight and resolved value; a rejection never poisons the cache. */
export function createAsyncResource<T>(importer: () => Promise<T>) {
  let value: T | undefined
  let pending: Promise<T> | undefined
  return {
    peek: () => value,
    load() {
      if (value !== undefined) return Promise.resolve(value)
      if (!pending) pending = importer().then(result => {
        value = result
        pending = undefined
        return result
      }, error => {
        pending = undefined
        throw error
      })
      return pending
    },
  }
}
