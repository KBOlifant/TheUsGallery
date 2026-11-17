import { Category } from '../models/Category.js'
import { Collection } from '../models/Collection.js'
import { Artwork } from '../models/Artwork.js'
import { ApiError, created } from '../http.js'
import { slugify } from '../utils/slug.js'
import { toCategorySummary } from '../utils/serialize.js'
import { uploadImage, deleteImage } from '../cloudinary.js'
import { deleteArtworks } from '../utils/cascade.js'

async function uniqueCategorySlug(name) {
  const base = slugify(name) || 'category'
  let slug = base
  for (let n = 2; await Category.exists({ slug }); n++) slug = `${base}-${n}`
  return slug
}

async function tryDeleteImage(publicId) {
  if (!publicId) return
  try {
    await deleteImage(publicId)
  } catch {
    /* best-effort */
  }
}

async function findCategory(slug) {
  const category = await Category.findOne({ slug })
  if (!category) throw new ApiError(`Category "${slug}" not found`, 404)
  return category
}

/** POST /admin/categories  (optional multipart "banner" + name, eyebrow, title, intro, cover, order) */
export async function createCategory({ body, file, user }) {
  const { name, eyebrow, title, intro, cover, order } = body
  if (!name?.trim()) throw new ApiError('Category name is required', 400)

  let bannerUrl = ''
  let bannerPublicId = ''
  if (file) {
    const up = await uploadImage(file.buffer, 'theusgallery/banners')
    bannerUrl = up.secure_url
    bannerPublicId = up.public_id
  }

  const count = await Category.countDocuments()
  const category = await Category.create({
    slug: await uniqueCategorySlug(name),
    name: name.trim(),
    eyebrow: eyebrow?.trim() || '',
    title: title?.trim() || '',
    intro: intro?.trim() || '',
    cover: cover?.trim() || '',
    bannerUrl,
    bannerPublicId,
    order: order !== undefined ? Number(order) : count,
    createdBy: user._id,
  })

  return created(toCategorySummary(category, 0))
}

/** PUT /admin/categories/:slug */
export async function updateCategory({ params, body, file }) {
  const category = await findCategory(params.slug)

  for (const f of ['name', 'eyebrow', 'title', 'intro', 'cover']) {
    if (body[f] !== undefined) category[f] = String(body[f]).trim()
  }
  if (body.order !== undefined) category.order = Number(body.order)

  if (file) {
    const up = await uploadImage(file.buffer, 'theusgallery/banners')
    await tryDeleteImage(category.bannerPublicId)
    category.bannerUrl = up.secure_url
    category.bannerPublicId = up.public_id
  }

  await category.save()
  return toCategorySummary(category, await Artwork.countDocuments({ categoryId: category._id }))
}

/** DELETE /admin/categories/:slug — cascades to collections + artworks. */
export async function deleteCategory({ params }) {
  const category = await findCategory(params.slug)

  const artworks = await deleteArtworks({ categoryId: category._id })
  const { deletedCount: collections } = await Collection.deleteMany({ categoryId: category._id })
  await tryDeleteImage(category.bannerPublicId)
  await Category.deleteOne({ _id: category._id })

  return { deleted: true, removed: { collections, artworks } }
}

/** PUT /admin/categories/order  { ids: [slug, …] } — the new order, first to last. */
export async function reorderCategories({ body }) {
  const ids = body.ids
  if (!Array.isArray(ids) || ids.length === 0) throw new ApiError('ids must be a non-empty array of category slugs', 400)

  const found = await Category.find({ slug: { $in: ids } }, '_id slug').lean()
  if (found.length !== new Set(ids).size) throw new ApiError('Unknown category in ids', 400)

  await Category.bulkWrite(ids.map((slug, order) => ({ updateOne: { filter: { slug }, update: { $set: { order } } } })))
  return { ok: true }
}
