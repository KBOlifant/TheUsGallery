/*
 * Shared client state for per-artwork fields that change after load
 * (saved, noteCount), so a card and the open modal stay in sync without
 * refetching. Values from the server are the default; local updates override.
 */
import { useMemo, useSyncExternalStore } from 'react'
import { deleteArtwork, setSaved, setLiked } from '../functions/api'

const overrides = new Map()
const listeners = new Set()

// Bumped on every change so useVisibleWorks can tell when to re-filter
// (the overrides Map is mutated in place, so its own reference never changes).
let version = 0

const emit = () => {
  version++
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function patchArtwork(id, patch) {
  overrides.set(id, { ...overrides.get(id), ...patch })
  emit()
}

/** Merge local overrides onto an artwork from the API. */
export function useArtworkState(artwork) {
  const patch = useSyncExternalStore(
    subscribe,
    () => (artwork ? overrides.get(artwork.id) : undefined),
    () => undefined, // server render: no local overrides yet
  )
  return artwork ? { ...artwork, ...patch } : artwork
}

/** `works`, minus any just deleted locally (see `removeArtwork`). */
export function useVisibleWorks(works) {
  const v = useSyncExternalStore(subscribe, () => version, () => 0)
  return useMemo(() => works.filter((w) => !overrides.get(w.id)?.deleted), [works, v])
}

/** Optimistic save toggle; rolls back if the request fails. */
export async function toggleSaved(artwork) {
  const next = !artwork.saved
  patchArtwork(artwork.id, { saved: next })
  try {
    await setSaved(artwork.id, next)
  } catch (err) {
    patchArtwork(artwork.id, { saved: !next })
    throw err
  }
}

/** Optimistic like toggle; reconciles likeCount with the server, rolls back on error. */
export async function toggleLiked(artwork) {
  const next = !artwork.liked
  const prevCount = artwork.likeCount ?? 0
  patchArtwork(artwork.id, { liked: next, likeCount: Math.max(0, prevCount + (next ? 1 : -1)) })
  try {
    const res = await setLiked(artwork.id, next)
    patchArtwork(artwork.id, { liked: res.liked, likeCount: res.likeCount })
  } catch (err) {
    patchArtwork(artwork.id, { liked: !next, likeCount: prevCount })
    throw err
  }
}

/** Delete an artwork on the server, then hide it everywhere it's shown (cards + modal). */
export async function removeArtwork(artworkId) {
  await deleteArtwork(artworkId)
  patchArtwork(artworkId, { deleted: true })
}
