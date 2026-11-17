import { Category } from '../models/Category.js'
import { Collection } from '../models/Collection.js'
import { ApiError, created } from '../http.js'
import { slugify } from '../utils/slug.js'
import { deleteArtworks } from '../utils/cascade.js'

function toCollection(c, categorySlug) {
  return {
    _id: String(c._id),
    id: c.slug,
    categoryId: categorySlug,
    eyebrow: c.eyebrow,
    title: c.title,
    description: c.description,
    order: c.order,
  }
}

async function uniqueCollectionSlug(categoryId, title) {
  const base = slugify(title) || 'collection'
  let slug = base
  for (let n = 2; await Collection.exists({ categoryId, slug }); n++) slug = `${base}-${n}`
  return slug
}

async function findCategoryBySlug(slug) {
  if (!slug) throw new ApiError('categoryId (slug) is required', 400)
  const category = await Category.findOne({ slug }).lean()
  if (!category) throw new ApiError(`Category "${slug}" not found`, 404)
  return category
}

async function findCollection(id) {
  const collection = await Collection.findById(id)
  if (!collection) throw new ApiError('Collection not found', 404)
  return collection
}

/** GET /admin/collections?categoryId=slug */
export async function listCollections({ query }) {
  const category = await findCategoryBySlug(query.categoryId)
  const cols = await Collection.find({ categoryId: category._id }).sort({ order: 1, createdAt: 1 }).lean()
  return cols.map((c) => toCollection(c, category.slug))
}

/** POST /admin/collections  { categoryId(slug), title, eyebrow?, description?, order? } */
export async function createCollection({ body, user }) {
  const { categoryId, title, eyebrow, description, order } = body
  const category = await findCategoryBySlug(categoryId)
  if (!title?.trim()) throw new ApiError('Collection title is required', 400)

  const count = await Collection.countDocuments({ categoryId: category._id })
  const collection = await Collection.create({
    slug: await uniqueCollectionSlug(category._id, title),
    categoryId: category._id,
    title: title.trim(),
    eyebrow: eyebrow?.trim() || '',
    description: description?.trim() || '',
    order: order !== undefined ? Number(order) : count,
    createdBy: user._id,
  })
  return created(toCollection(collection, category.slug))
}

/** PUT /admin/collections/:id  (_id) */
export async function updateCollection({ params, body }) {
  const collection = await findCollection(params.id)

  for (const f of ['title', 'eyebrow', 'description']) {
    if (body[f] !== undefined) collection[f] = String(body[f]).trim()
  }
  if (body.order !== undefined) collection.order = Number(body.order)
  await collection.save()

  const category = await Category.findById(collection.categoryId, 'slug').lean()
  return toCollection(collection, category?.slug)
}

/** DELETE /admin/collections/:id  (_id) — cascades to its artworks. */
export async function deleteCollection({ params }) {
  const collection = await findCollection(params.id)
  const artworks = await deleteArtworks({ collectionId: collection._id })
  await Collection.deleteOne({ _id: collection._id })
  return { deleted: true, removed: { artworks } }
}

/** PUT /admin/collections/order  { ids: [_id, …] } — the new order within one category. */
export async function reorderCollections({ body }) {
  const ids = body.ids
  if (!Array.isArray(ids) || ids.length === 0) throw new ApiError('ids must be a non-empty array of collection ids', 400)

  const found = await Collection.find({ _id: { $in: ids } }, '_id categoryId').lean()
  if (found.length !== new Set(ids).size) throw new ApiError('Unknown collection in ids', 400)
  if (new Set(found.map((c) => String(c.categoryId))).size > 1) throw new ApiError('Collections must share one category', 400)

  await Collection.bulkWrite(ids.map((_id, order) => ({ updateOne: { filter: { _id }, update: { $set: { order } } } })))
  return { ok: true }
}
