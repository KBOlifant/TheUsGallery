import { Category } from '../models/Category.js'
import { Collection } from '../models/Collection.js'
import { Artwork } from '../models/Artwork.js'
import { ApiError } from '../http.js'
import { toCategorySummary, toCategoryDetail } from '../utils/serialize.js'
import { interactionSets } from '../utils/interactions.js'

/** GET /categories */
export async function getCategories() {
  const categories = await Category.find().sort({ order: 1, createdAt: 1 }).lean()

  // One aggregate for all work counts, keyed by categoryId.
  const counts = await Artwork.aggregate([{ $group: { _id: '$categoryId', n: { $sum: 1 } } }])
  const countBy = new Map(counts.map((c) => [String(c._id), c.n]))

  return categories.map((c) => toCategorySummary(c, countBy.get(String(c._id)) || 0))
}

/** GET /categories/:id  (id = slug) */
export async function getCategory({ params, user }) {
  const category = await Category.findOne({ slug: params.id }).lean()
  if (!category) throw new ApiError(`Category "${params.id}" not found`, 404)

  const collections = await Collection.find({ categoryId: category._id }).sort({ order: 1, createdAt: 1 }).lean()
  const works = await Artwork.find({ categoryId: category._id }).sort({ order: 1, createdAt: 1 }).lean()

  const worksByCollectionId = new Map()
  for (const w of works) {
    const key = String(w.collectionId)
    if (!worksByCollectionId.has(key)) worksByCollectionId.set(key, [])
    worksByCollectionId.get(key).push(w)
  }

  const { savedIds, likedIds } = await interactionSets(user?._id, works.map((w) => w._id))

  return toCategoryDetail(category, collections, worksByCollectionId, { savedIds, likedIds, currentUser: user })
}
