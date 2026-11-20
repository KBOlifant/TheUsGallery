/** Likes and saves (favourites) — all idempotent, approved users only. */
import { Artwork } from '../models/Artwork.js'
import { Category } from '../models/Category.js'
import { Collection } from '../models/Collection.js'
import { Save } from '../models/Save.js'
import { Like } from '../models/Like.js'
import { ApiError } from '../http.js'
import { toArtworkSummary } from '../utils/serialize.js'

async function findArtwork(slug, fields = '_id') {
  const artwork = await Artwork.findOne({ slug }, fields).lean()
  if (!artwork) throw new ApiError(`Artwork "${slug}" not found`, 404)
  return artwork
}

/** PUT /artworks/:id/like → { id, liked, likeCount } */
export async function like({ params, user }) {
  const artwork = await findArtwork(params.id, '_id likeCount')

  const r = await Like.updateOne(
    { artworkId: artwork._id, userId: user._id },
    { $setOnInsert: { artworkId: artwork._id, userId: user._id } },
    { upsert: true }
  )

  let likeCount = artwork.likeCount
  if (r.upsertedCount === 1) {
    const updated = await Artwork.findByIdAndUpdate(artwork._id, { $inc: { likeCount: 1 } }, { new: true }).lean()
    likeCount = updated.likeCount
  }
  return { id: params.id, liked: true, likeCount }
}

/** DELETE /artworks/:id/like → { id, liked, likeCount } */
export async function unlike({ params, user }) {
  const artwork = await findArtwork(params.id, '_id likeCount')

  const r = await Like.deleteOne({ artworkId: artwork._id, userId: user._id })

  let likeCount = artwork.likeCount
  if (r.deletedCount === 1 && artwork.likeCount > 0) {
    const updated = await Artwork.findByIdAndUpdate(artwork._id, { $inc: { likeCount: -1 } }, { new: true }).lean()
    likeCount = updated.likeCount
  }
  return { id: params.id, liked: false, likeCount }
}

/** POST /artworks/:id/dislike → { id, dislikeCount }. Compounds — no per-user limit, unlike likes/saves. */
export async function dislike({ params }) {
  const artwork = await findArtwork(params.id)
  const updated = await Artwork.findByIdAndUpdate(artwork._id, { $inc: { dislikeCount: 1 } }, { new: true }).lean()
  return { id: params.id, dislikeCount: updated.dislikeCount }
}

/** PUT /artworks/:id/save — add to favourites. */
export async function setSaved({ params, user }) {
  const artwork = await findArtwork(params.id)
  await Save.updateOne(
    { artworkId: artwork._id, userId: user._id },
    { $setOnInsert: { artworkId: artwork._id, userId: user._id } },
    { upsert: true }
  )
  return { id: params.id, saved: true }
}

/** DELETE /artworks/:id/save — remove from favourites. */
export async function unsetSaved({ params, user }) {
  const artwork = await findArtwork(params.id)
  await Save.deleteOne({ artworkId: artwork._id, userId: user._id })
  return { id: params.id, saved: false }
}

/** GET /saved — the current user's favourites as ArtworkSummary[], most recent first. */
export async function getSaved({ user }) {
  const saves = await Save.find({ userId: user._id }).sort({ createdAt: -1 }).lean()
  if (saves.length === 0) return []

  const artworkIds = saves.map((s) => s.artworkId)
  const artworks = await Artwork.find({ _id: { $in: artworkIds } }).lean()

  const [cats, cols, likes] = await Promise.all([
    Category.find({ _id: { $in: artworks.map((a) => a.categoryId) } }, 'slug').lean(),
    Collection.find({ _id: { $in: artworks.map((a) => a.collectionId) } }, 'slug').lean(),
    Like.find({ userId: user._id, artworkId: { $in: artworkIds } }, 'artworkId').lean(),
  ])
  const catSlug = new Map(cats.map((c) => [String(c._id), c.slug]))
  const colSlug = new Map(cols.map((c) => [String(c._id), c.slug]))
  const likedIds = new Set(likes.map((l) => String(l.artworkId)))
  const savedIds = new Set(artworkIds.map(String)) // all of these are saved
  const byId = new Map(artworks.map((a) => [String(a._id), a]))

  return saves
    .map((s) => byId.get(String(s.artworkId)))
    .filter(Boolean)
    .map((a) =>
      toArtworkSummary(a, {
        categorySlug: catSlug.get(String(a.categoryId)),
        collectionSlug: colSlug.get(String(a.collectionId)),
        savedIds,
        likedIds,
        currentUser: user,
      })
    )
}
