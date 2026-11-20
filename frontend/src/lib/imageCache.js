/**
 * Caches each photo's raw bytes in IndexedDB the first time it's shown, so a repeat
 * visit (same card, or the card reopened as the modal) paints from the local cache
 * instead of downloading the image again. Falls back to the plain image URL — same as
 * before this cache existed — whenever caching isn't possible (no IndexedDB, blocked
 * CORS fetch, offline): the <img> just loads the URL directly in that case.
 */
'use client'

import { useEffect, useState } from 'react'
import { idbGet, idbSet, STORE_IMAGES } from './idb'

// object URLs already created this session, by source URL — reused across every
// card/modal showing the same photo instead of re-reading IndexedDB each time.
const objectUrls = new Map()

/** Returns a local object: URL for `src` once cached, or `null` while it's not ready yet. */
export function useCachedImageUrl(src) {
  const [url, setUrl] = useState(() => (src && objectUrls.get(src)) || null)

  useEffect(() => {
    if (!src) return
    const existing = objectUrls.get(src)
    if (existing) {
      setUrl(existing)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const cachedBlob = await idbGet(STORE_IMAGES, src)
        const blob = cachedBlob ?? (await fetchBlob(src))
        if (!cachedBlob) idbSet(STORE_IMAGES, src, blob) // fire-and-forget; a failed write just means no cache next time
        if (cancelled) return
        const objectUrl = URL.createObjectURL(blob)
        objectUrls.set(src, objectUrl)
        setUrl(objectUrl)
      } catch {
        // CORS blocked, offline, or IndexedDB unavailable: leave url null so the
        // caller's <img src> falls back to the original address.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [src])

  return url
}

async function fetchBlob(src) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
  return res.blob()
}
