/**
 * Minimal IndexedDB wrapper backing the app's two caches: `json` (category/collection
 * data — see dataCache.js) and `images` (raw photo bytes — see imageCache.js). No
 * external dependency; just the pieces those two modules need.
 *
 * Every call is best-effort: IndexedDB can be unavailable (SSR, private browsing,
 * quota, disabled storage) or a request can simply fail, and none of that should ever
 * break the gallery — callers always get `undefined` back on failure, never a throw.
 */

const DB_NAME = 'theusgallery-cache'
const DB_VERSION = 1
export const STORE_JSON = 'json'
export const STORE_IMAGES = 'images'

let dbPromise = null

function openDB() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB unavailable'))
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_JSON)) db.createObjectStore(STORE_JSON)
      if (!db.objectStoreNames.contains(STORE_IMAGES)) db.createObjectStore(STORE_IMAGES)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Lazily open (and cache) the one shared connection; re-attempt next time if opening failed. */
function getDB() {
  if (!dbPromise) dbPromise = openDB().catch((err) => { dbPromise = null; throw err })
  return dbPromise
}

const asPromise = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => reject(req.error)
})

/** Read one value by key, or `undefined` if missing or the store couldn't be opened. */
export async function idbGet(storeName, key) {
  try {
    const db = await getDB()
    return await asPromise(db.transaction(storeName, 'readonly').objectStore(storeName).get(key))
  } catch {
    return undefined
  }
}

/** Write one value by key. Failures are swallowed — a cache write is never required to succeed. */
export async function idbSet(storeName, key, value) {
  try {
    const db = await getDB()
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(value, key)
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } catch {
    /* best-effort cache */
  }
}

/** Empty a whole store. Same best-effort contract as idbSet. */
export async function idbClear(storeName) {
  try {
    const db = await getDB()
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).clear()
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } catch {
    /* best-effort cache */
  }
}

/** Remove one value by key. Same best-effort contract as idbSet. */
export async function idbDelete(storeName, key) {
  try {
    const db = await getDB()
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(key)
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } catch {
    /* best-effort cache */
  }
}
