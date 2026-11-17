/*
 * In-browser mock of the TheUsGallery backend.
 * Same function signatures and return shapes as the real API (see api.js / README).
 * Saves and visitor notes persist in localStorage so they survive a reload.
 */
import { ApiError } from './client'
import { categories, seedNotes } from './mockData'

const SAVED_KEY = 'aperture:saved'
const NOTES_KEY = 'aperture:notes'

const pad = (n) => String(n).padStart(2, '0')

// ---- latency + storage helpers --------------------------------------------

const delay = () => {
  if (import.meta.env.MODE === 'test') return Promise.resolve()
  return new Promise((r) => setTimeout(r, 200 + Math.random() * 300))
}

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked: keep working in memory only */
  }
}

const savedIds = () => new Set(readStore(SAVED_KEY, []))
const addedNotes = () => readStore(NOTES_KEY, {})

function notesFor(artworkId) {
  return [...(seedNotes[artworkId] ?? []), ...(addedNotes()[artworkId] ?? [])]
}

// ---- indexes over the static data -----------------------------------------

const index = new Map() // artworkId -> { work, category, collection, position, total }

for (const category of categories) {
  const works = category.collections.flatMap((c) => c.works.map((w) => ({ w, c })))
  works.forEach(({ w, c }, i) => {
    index.set(w.id, { work: w, category, collection: c, position: i + 1, total: works.length })
  })
}

const workCount = (category) => category.collections.reduce((n, c) => n + c.works.length, 0)

function toArtworkSummary(work, category, collection, saved = savedIds()) {
  return {
    ...structuredClone(work),
    categoryId: category.id,
    collectionId: collection.id,
    saved: saved.has(work.id),
    noteCount: notesFor(work.id).length,
  }
}

function toCategorySummary(category, i) {
  return {
    id: category.id,
    index: pad(i + 1),
    name: category.name,
    eyebrow: category.eyebrow,
    cover: category.cover,
    workCount: workCount(category),
  }
}

function findArtwork(id) {
  const entry = index.get(id)
  if (!entry) throw new ApiError(`Artwork "${id}" not found`, 404)
  return entry
}

// ---- endpoints -------------------------------------------------------------

/** GET /categories */
export async function getCategories() {
  await delay()
  return categories.map(toCategorySummary)
}

/** GET /categories/:id  — category with its collections and artwork summaries */
export async function getCategory(id) {
  await delay()
  const i = categories.findIndex((c) => c.id === id)
  if (i === -1) throw new ApiError(`Category "${id}" not found`, 404)
  const category = categories[i]
  const saved = savedIds()
  return {
    ...toCategorySummary(category, i),
    title: category.title,
    intro: category.intro,
    collections: category.collections.map((c, ci) => ({
      id: c.id,
      index: pad(ci + 1),
      eyebrow: c.eyebrow,
      title: c.title,
      description: c.description,
      works: c.works.map((w) => toArtworkSummary(w, category, c, saved)),
    })),
  }
}

/** GET /artworks/:id  — summary plus its position within the category */
export async function getArtwork(id) {
  await delay()
  const { work, category, collection, position, total } = findArtwork(id)
  return { ...toArtworkSummary(work, category, collection), position, total }
}

/** GET /artworks/:id/notes */
export async function getNotes(artworkId) {
  await delay()
  findArtwork(artworkId)
  return structuredClone(notesFor(artworkId))
}

/** POST /artworks/:id/notes  { text, author? } */
export async function addNote(artworkId, { text, author = 'You' }) {
  await delay()
  findArtwork(artworkId)
  const clean = text?.trim()
  if (!clean) throw new ApiError('Note text is required', 400)
  if (clean.length > 500) throw new ApiError('Notes are limited to 500 characters', 400)

  const note = { id: crypto.randomUUID(), author, text: clean, createdAt: new Date().toISOString() }
  const all = addedNotes()
  all[artworkId] = [...(all[artworkId] ?? []), note]
  writeStore(NOTES_KEY, all)
  return note
}

/** PUT /artworks/:id/save  (saved=true) · DELETE /artworks/:id/save  (saved=false) */
export async function setSaved(artworkId, saved) {
  await delay()
  findArtwork(artworkId)
  const ids = savedIds()
  saved ? ids.add(artworkId) : ids.delete(artworkId)
  writeStore(SAVED_KEY, [...ids])
  return { id: artworkId, saved }
}

/** GET /saved */
export async function getSavedWorks() {
  await delay()
  const ids = savedIds()
  return [...ids]
    .filter((id) => index.has(id))
    .map((id) => {
      const { work, category, collection } = index.get(id)
      return toArtworkSummary(work, category, collection, ids)
    })
}
