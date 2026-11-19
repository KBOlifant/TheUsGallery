/**
 * Turns Mongoose docs into the exact JSON shapes the frontend expects
 * (see frontend/README.md "API contract"). Keeping this in one place means
 * the real API and the mock stay interchangeable.
 */
import { pad } from './slug.js'

/** Category's cover as a CSS background value: a banner image wins over the gradient. */
function resolveCover(category) {
  return category.bannerUrl ? `url('${category.bannerUrl}')` : category.cover || ''
}

/** CategorySummary { id, index, name, eyebrow, cover, workCount } */
export function toCategorySummary(category, workCount = 0) {
  return {
    id: category.slug,
    index: pad(category.order + 1),
    name: category.name,
    eyebrow: category.eyebrow,
    cover: resolveCover(category),
    workCount,
  }
}

/**
 * ArtworkSummary { id, title, artist, year, ratio, image, categoryId, collectionId,
 *                  saved, noteCount, likeCount, liked }
 * `savedIds` / `likedIds` are Sets of artwork _id strings for the current user
 * (empty when unauthenticated).
 */
export function toArtworkSummary(artwork, { categorySlug, collectionSlug, savedIds, likedIds } = {}) {
  const id = String(artwork._id)
  return {
    id: artwork.slug,
    title: artwork.title,
    artist: artwork.artist,
    year: artwork.year,
    meta: artwork.meta || {},
    ratio: artwork.ratio,
    image: { gradient: artwork.image?.gradient || '', alt: artwork.image?.alt || '', src: artwork.image?.src || '' },
    categoryId: categorySlug,
    collectionId: collectionSlug,
    saved: savedIds ? savedIds.has(id) : false,
    liked: likedIds ? likedIds.has(id) : false,
    noteCount: artwork.noteCount ?? 0,
    likeCount: artwork.likeCount ?? 0,
  }
}

/** CategorySummary + { title, intro, collections: [{ id, index, eyebrow, title, description, works }] } */
export function toCategoryDetail(category, collections, worksByCollectionId, ctx = {}) {
  const workCount = collections.reduce((n, c) => n + (worksByCollectionId.get(String(c._id))?.length || 0), 0)
  return {
    ...toCategorySummary(category, workCount),
    title: category.title,
    intro: category.intro,
    collections: collections.map((c, i) => ({
      id: c.slug,
      index: pad(i + 1),
      eyebrow: c.eyebrow,
      title: c.title,
      description: c.description,
      works: (worksByCollectionId.get(String(c._id)) || []).map((w) =>
        toArtworkSummary(w, { categorySlug: category.slug, collectionSlug: c.slug, ...ctx })
      ),
    })),
  }
}

/** Artwork (detail) = summary + { position, total } within its category. */
export function toArtworkDetail(artwork, { categorySlug, collectionSlug, position, total, savedIds, likedIds }) {
  return {
    ...toArtworkSummary(artwork, { categorySlug, collectionSlug, savedIds, likedIds }),
    position,
    total,
  }
}
