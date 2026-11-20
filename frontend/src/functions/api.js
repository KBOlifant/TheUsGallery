/*
 * Public API for the TheUsGallery frontend. Components import from here only.
 *
 * Calls go to the real API (src/app/api) by default. Set NEXT_PUBLIC_USE_MOCK=true
 * to route every call to the in-browser mock instead (the tests do this);
 * no component needs to change.
 */
import { request } from './client'
import * as mock from './mockApi'
import { cachedJSON, invalidateCategoryCache } from '../lib/dataCache'

export { ApiError } from './client'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

const enc = encodeURIComponent

/*
 * Category and collection names change rarely — once fetched they're cached in
 * IndexedDB (see lib/dataCache.js) and served from there, with a background refetch
 * keeping the cache warm for next time. Any upload, delete or admin edit invalidates
 * the whole cache (see invalidate() below) so the person who made the change always
 * sees it on their next visit.
 */
export const getCategories = () =>
  USE_MOCK ? mock.getCategories() : cachedJSON('categories', () => request('/categories'))

export const getCategory = (id) =>
  USE_MOCK ? mock.getCategory(id) : cachedJSON(`category:${id}`, () => request(`/categories/${enc(id)}`))

export const getArtwork = (id) => (USE_MOCK ? mock.getArtwork(id) : request(`/artworks/${enc(id)}`))

export const getNotes = (artworkId) =>
  USE_MOCK ? mock.getNotes(artworkId) : request(`/artworks/${enc(artworkId)}/notes`)

export const addNote = (artworkId, note) =>
  USE_MOCK
    ? mock.addNote(artworkId, note)
    : request(`/artworks/${enc(artworkId)}/notes`, { method: 'POST', body: note })

export const setSaved = (artworkId, saved) =>
  USE_MOCK
    ? mock.setSaved(artworkId, saved)
    : request(`/artworks/${enc(artworkId)}/save`, { method: saved ? 'PUT' : 'DELETE' }).then(() => ({
        id: artworkId,
        saved,
      }))

export const getSavedWorks = () => (USE_MOCK ? mock.getSavedWorks() : request('/saved'))

// ---- Real-API-only features (auth, likes, uploads, admin) -------------------
// These have no mock equivalent; they need the real API (NEXT_PUBLIC_USE_MOCK unset).

const realOnly = (name) => {
  throw new Error(`${name}() requires the real API (unset NEXT_PUBLIC_USE_MOCK)`)
}

/** Clears the cached category/collection names after something changes them. Best-effort. */
const invalidate = (result) => Promise.resolve(invalidateCategoryCache()).then(() => result)

/** Current user's profile + approval status. */
export const getMe = () => (USE_MOCK ? realOnly('getMe') : request('/me'))

/** Like / unlike an artwork → { id, liked, likeCount }. */
export const setLiked = (artworkId, liked) =>
  USE_MOCK
    ? realOnly('setLiked')
    : request(`/artworks/${enc(artworkId)}/like`, { method: liked ? 'PUT' : 'DELETE' })

/**
 * Upload one image. `fields` = { categoryId, collectionId }. `file` is a File/Blob.
 * The server reads the title, year and other details from the file itself.
 * Returns the created ArtworkSummary. Multi-file uploads queue one call per file (see lib/uploadQueue).
 */
export const uploadArtwork = (fields, file) => {
  if (USE_MOCK) realOnly('uploadArtwork')
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v != null) form.append(k, v)
  form.append('image', file)
  return request('/artworks', { method: 'POST', body: form, isFormData: true }).then(invalidate)
}

/** Delete an artwork. The uploader may delete their own work; admins may delete any work. */
export const deleteArtwork = (artworkId) =>
  USE_MOCK
    ? realOnly('deleteArtwork')
    : request(`/artworks/${enc(artworkId)}`, { method: 'DELETE' }).then(invalidate)

// ---- Admin ------------------------------------------------------------------

export const adminListUsers = (status) =>
  USE_MOCK ? realOnly('adminListUsers') : request(`/admin/users${status ? `?status=${enc(status)}` : ''}`)

export const adminApproveUser = (id) =>
  USE_MOCK ? realOnly('adminApproveUser') : request(`/admin/users/${enc(id)}/approve`, { method: 'PUT' })

export const adminRejectUser = (id) =>
  USE_MOCK ? realOnly('adminRejectUser') : request(`/admin/users/${enc(id)}/reject`, { method: 'PUT' })

export const adminListCollections = (categoryId) =>
  USE_MOCK ? realOnly('adminListCollections') : request(`/admin/collections?categoryId=${enc(categoryId)}`)

export const adminCreateCollection = (body) =>
  USE_MOCK ? realOnly('adminCreateCollection') : request('/admin/collections', { method: 'POST', body }).then(invalidate)

export const adminDeleteCollection = (id) =>
  USE_MOCK
    ? realOnly('adminDeleteCollection')
    : request(`/admin/collections/${enc(id)}`, { method: 'DELETE' }).then(invalidate)

/** Create a category. `fields` = { name, eyebrow?, title?, intro?, cover? }, optional banner File. */
export const adminCreateCategory = (fields, banner) => {
  if (USE_MOCK) realOnly('adminCreateCategory')
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v != null) form.append(k, v)
  if (banner) form.append('banner', banner)
  return request('/admin/categories', { method: 'POST', body: form, isFormData: true }).then(invalidate)
}

/** Update a category. `fields` = any of { name, eyebrow, title, intro, cover, order }; optional new banner File. */
export const adminUpdateCategory = (slug, fields, banner) => {
  if (USE_MOCK) realOnly('adminUpdateCategory')
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v != null) form.append(k, v)
  if (banner) form.append('banner', banner)
  return request(`/admin/categories/${enc(slug)}`, { method: 'PUT', body: form, isFormData: true }).then(invalidate)
}

/** Update a collection by _id. `body` = any of { title, eyebrow, description, order }. */
export const adminUpdateCollection = (id, body) =>
  USE_MOCK
    ? realOnly('adminUpdateCollection')
    : request(`/admin/collections/${enc(id)}`, { method: 'PUT', body }).then(invalidate)

export const adminDeleteCategory = (slug) =>
  USE_MOCK ? realOnly('adminDeleteCategory') : request(`/admin/categories/${enc(slug)}`, { method: 'DELETE' }).then(invalidate)

/** Save a new category order. `slugs` = every category slug, first to last. */
export const adminReorderCategories = (slugs) =>
  USE_MOCK
    ? realOnly('adminReorderCategories')
    : request('/admin/categories/order', { method: 'PUT', body: { ids: slugs } }).then(invalidate)

/** Save a new collection order within a category. `ids` = collection _ids, first to last. */
export const adminReorderCollections = (ids) =>
  USE_MOCK
    ? realOnly('adminReorderCollections')
    : request('/admin/collections/order', { method: 'PUT', body: { ids } }).then(invalidate)
