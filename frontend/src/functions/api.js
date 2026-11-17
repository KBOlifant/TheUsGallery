/*
 * Public API for the Aperture frontend. Components import from here only.
 *
 * Calls go to the real API (src/app/api) by default. Set NEXT_PUBLIC_USE_MOCK=true
 * to route every call to the in-browser mock instead (the tests do this);
 * no component needs to change.
 */
import { request } from './client'
import * as mock from './mockApi'

export { ApiError } from './client'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

const enc = encodeURIComponent

export const getCategories = () => (USE_MOCK ? mock.getCategories() : request('/categories'))

export const getCategory = (id) => (USE_MOCK ? mock.getCategory(id) : request(`/categories/${enc(id)}`))

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

/** Current user's profile + approval status. */
export const getMe = () => (USE_MOCK ? realOnly('getMe') : request('/me'))

/** Like / unlike an artwork → { id, liked, likeCount }. */
export const setLiked = (artworkId, liked) =>
  USE_MOCK
    ? realOnly('setLiked')
    : request(`/artworks/${enc(artworkId)}/like`, { method: liked ? 'PUT' : 'DELETE' })

/**
 * Upload a new artwork. `fields` = { categoryId, collectionId, title, artist?, year?, alt? }.
 * `file` is a File/Blob. Returns the created ArtworkSummary.
 */
export const uploadArtwork = (fields, file) => {
  if (USE_MOCK) realOnly('uploadArtwork')
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v != null) form.append(k, v)
  form.append('image', file)
  return request('/artworks', { method: 'POST', body: form, isFormData: true })
}

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
  USE_MOCK ? realOnly('adminCreateCollection') : request('/admin/collections', { method: 'POST', body })

export const adminDeleteCollection = (id) =>
  USE_MOCK ? realOnly('adminDeleteCollection') : request(`/admin/collections/${enc(id)}`, { method: 'DELETE' })

/** Create a category. `fields` = { name, eyebrow?, title?, intro?, cover? }, optional banner File. */
export const adminCreateCategory = (fields, banner) => {
  if (USE_MOCK) realOnly('adminCreateCategory')
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v != null) form.append(k, v)
  if (banner) form.append('banner', banner)
  return request('/admin/categories', { method: 'POST', body: form, isFormData: true })
}

/** Update a category. `fields` = any of { name, eyebrow, title, intro, cover, order }; optional new banner File. */
export const adminUpdateCategory = (slug, fields, banner) => {
  if (USE_MOCK) realOnly('adminUpdateCategory')
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v != null) form.append(k, v)
  if (banner) form.append('banner', banner)
  return request(`/admin/categories/${enc(slug)}`, { method: 'PUT', body: form, isFormData: true })
}

/** Update a collection by _id. `body` = any of { title, eyebrow, description, order }. */
export const adminUpdateCollection = (id, body) =>
  USE_MOCK ? realOnly('adminUpdateCollection') : request(`/admin/collections/${enc(id)}`, { method: 'PUT', body })

export const adminDeleteCategory = (slug) =>
  USE_MOCK ? realOnly('adminDeleteCategory') : request(`/admin/categories/${enc(slug)}`, { method: 'DELETE' })

/** Save a new category order. `slugs` = every category slug, first to last. */
export const adminReorderCategories = (slugs) =>
  USE_MOCK ? realOnly('adminReorderCategories') : request('/admin/categories/order', { method: 'PUT', body: { ids: slugs } })

/** Save a new collection order within a category. `ids` = collection _ids, first to last. */
export const adminReorderCollections = (ids) =>
  USE_MOCK ? realOnly('adminReorderCollections') : request('/admin/collections/order', { method: 'PUT', body: { ids } })
