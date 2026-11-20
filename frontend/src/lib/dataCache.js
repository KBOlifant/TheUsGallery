/**
 * Stale-while-revalidate cache for the category/collection names the gallery nav and
 * pages need (getCategories/getCategory in functions/api.js). A cached entry is
 * returned immediately — the page never waits on the network for data it already has —
 * while a fresh copy is fetched in the background and written back for next time.
 *
 * The storage backend is injected (defaults to IndexedDB via idb.js) so the
 * revalidation logic can be unit-tested with a plain in-memory store.
 */
import { idbClear, idbGet, idbSet, STORE_JSON } from './idb'

const defaultStore = {
  get: (key) => idbGet(STORE_JSON, key),
  set: (key, value) => idbSet(STORE_JSON, key, value),
}

/**
 * @param {string} key          cache key, e.g. "categories" or "category:light"
 * @param {() => Promise<any>} fetcher  loads the fresh value from the network
 * @param {{ get, set }} [store]  storage backend; defaults to IndexedDB
 */
export async function cachedJSON(key, fetcher, store = defaultStore) {
  const cached = await store.get(key)
  if (cached !== undefined) {
    // Have it already — return now, and quietly refresh the cache for the next visit.
    fetcher().then((fresh) => store.set(key, fresh)).catch(() => {})
    return cached
  }
  const fresh = await fetcher()
  await store.set(key, fresh)
  return fresh
}

/**
 * Drop every cached category/collection. Called after any upload, delete, or admin
 * edit, so the person who just changed something always sees it on their next visit
 * rather than a stale cached copy from before the change.
 */
export const invalidateCategoryCache = () => idbClear(STORE_JSON)

/** An in-memory `{ get, set }` store for tests, or for pages that shouldn't persist to disk. */
export function createMemoryStore() {
  const map = new Map()
  return {
    get: async (key) => map.get(key),
    set: async (key, value) => {
      map.set(key, value)
    },
  }
}
