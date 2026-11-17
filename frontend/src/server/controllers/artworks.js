import { Artwork } from '../models/Artwork.js'
import { Category } from '../models/Category.js'
import { Collection } from '../models/Collection.js'
import { Note } from '../models/Note.js'
import { ApiError, created } from '../http.js'
import { toArtworkDetail, toArtworkSummary } from '../utils/serialize.js'
import { interactionSets } from '../utils/interactions.js'
import { uploadImage } from '../cloudinary.js'
import { slugify } from '../utils/slug.js'

/** POST /artworks  (multipart: image + categoryId, collectionId, title, artist?, year?, alt?) */
export async function createArtwork({ body, file, user }) {
  const { categoryId, collectionId, title, artist, year, alt } = body
  if (!title?.trim()) throw new ApiError('Title is required', 400)
  if (!categoryId || !collectionId) throw new ApiError('categoryId and collectionId are required', 400)
  if (!file) throw new ApiError('An image file is required', 400)

  const category = await Category.findOne({ slug: categoryId }).lean()
  if (!category) throw new ApiError(`Category "${categoryId}" not found`, 404)
  const collection = await Collection.findOne({ slug: collectionId, categoryId: category._id }).lean()
  if (!collection) throw new ApiError(`Collection "${collectionId}" not found in category "${categoryId}"`, 404)

  const uploaded = await uploadImage(file.buffer)

  // Unique slug derived from the title.
  const base = slugify(title) || 'untitled'
  let slug = base
  for (let n = 2; await Artwork.exists({ slug }); n++) slug = `${base}-${n}`

  const ratio =
    uploaded.width && uploaded.height
      ? Number((uploaded.width / uploaded.height).toFixed(2))
      : Number(body.ratio) || 0.8
  const order = await Artwork.countDocuments({ categoryId: category._id })

  const artwork = await Artwork.create({
    slug,
    categoryId: category._id,
    collectionId: collection._id,
    title: title.trim(),
    artist: artist?.trim() || user.displayName || '',
    year: year ? Number(year) : undefined,
    ratio,
    image: { src: uploaded.secure_url, publicId: uploaded.public_id, gradient: '', alt: alt?.trim() || title.trim() },
    order,
    uploadedBy: user._id,
  })

  return created(
    toArtworkSummary(artwork, {
      categorySlug: category.slug,
      collectionSlug: collection.slug,
      savedIds: new Set(),
      likedIds: new Set(),
    })
  )
}

/** GET /artworks/:id  (id = slug) — summary plus position within its category. */
export async function getArtwork({ params, user }) {
  const artwork = await Artwork.findOne({ slug: params.id }).lean()
  if (!artwork) throw new ApiError(`Artwork "${params.id}" not found`, 404)

  const [category, collection] = await Promise.all([
    Category.findById(artwork.categoryId).lean(),
    Collection.findById(artwork.collectionId).lean(),
  ])

  // Position within the whole category, ordered the same way the category view is.
  const siblings = await Artwork.find({ categoryId: artwork.categoryId }, '_id')
    .sort({ order: 1, createdAt: 1 })
    .lean()
  const total = siblings.length
  const position = siblings.findIndex((s) => String(s._id) === String(artwork._id)) + 1

  const { savedIds, likedIds } = await interactionSets(user?._id, [artwork._id])

  return toArtworkDetail(artwork, {
    categorySlug: category?.slug,
    collectionSlug: collection?.slug,
    position,
    total,
    savedIds,
    likedIds,
  })
}

const toNote = (n) => ({ id: String(n._id), author: n.author, text: n.text, createdAt: n.createdAt.toISOString() })

/** GET /artworks/:id/notes */
export async function getNotes({ params }) {
  const artwork = await Artwork.findOne({ slug: params.id }, '_id').lean()
  if (!artwork) throw new ApiError(`Artwork "${params.id}" not found`, 404)

  const notes = await Note.find({ artworkId: artwork._id }).sort({ createdAt: 1 }).lean()
  return notes.map(toNote)
}

/** POST /artworks/:id/notes  { text } — leave a comment (approved users only). */
export async function addNote({ params, body, user }) {
  const artwork = await Artwork.findOne({ slug: params.id }, '_id').lean()
  if (!artwork) throw new ApiError(`Artwork "${params.id}" not found`, 404)

  // Match the mock's validation rules exactly.
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!text) throw new ApiError('Note text is required', 400)
  if (text.length > 500) throw new ApiError('Notes are limited to 500 characters', 400)

  const author = user.displayName || user.email?.split('@')[0] || 'Member'
  const note = await Note.create({ artworkId: artwork._id, userId: user._id, author, text })
  await Artwork.updateOne({ _id: artwork._id }, { $inc: { noteCount: 1 } })

  return created(toNote(note))
}
