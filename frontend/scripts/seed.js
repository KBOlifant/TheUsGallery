/**
 * Seeds MongoDB with the frontend's mock content so the real API serves the
 * same gallery the mock does. Re-runnable: it clears content collections first
 * (Users / Likes / Saves are preserved only in that Users survive; see below).
 *
 * Content source of truth: src/functions/mockData.js
 *
 *   npm run seed
 */
import mongoose from 'mongoose'
import { connectDB } from '../src/server/db.js'
import { Category } from '../src/server/models/Category.js'
import { Collection } from '../src/server/models/Collection.js'
import { Artwork } from '../src/server/models/Artwork.js'
import { Note } from '../src/server/models/Note.js'
import { Like } from '../src/server/models/Like.js'
import { Save } from '../src/server/models/Save.js'

// Pull the content straight from the frontend mock (no duplication).
import { categories, seedNotes } from '../src/functions/mockData.js'

async function run() {
  await connectDB()
  console.log('[seed] clearing content collections…')
  // Content is regenerated; interactions reference artworks that are recreated,
  // so clear them too. User accounts are left untouched.
  await Promise.all([
    Category.deleteMany({}),
    Collection.deleteMany({}),
    Artwork.deleteMany({}),
    Note.deleteMany({}),
    Like.deleteMany({}),
    Save.deleteMany({}),
  ])

  let catCount = 0
  let colCount = 0
  let artCount = 0
  const artworkBySlug = new Map()

  for (const [ci, cat] of categories.entries()) {
    const category = await Category.create({
      slug: cat.id,
      name: cat.name,
      eyebrow: cat.eyebrow || '',
      title: cat.title || '',
      intro: cat.intro || '',
      cover: cat.cover || '',
      order: ci,
    })
    catCount++

    let positionInCategory = 0 // flattened order across the category's collections

    for (const [coi, col] of cat.collections.entries()) {
      const collection = await Collection.create({
        slug: col.id,
        categoryId: category._id,
        eyebrow: col.eyebrow || '',
        title: col.title,
        description: col.description || '',
        order: coi,
      })
      colCount++

      for (const work of col.works) {
        const noteCount = seedNotes[work.id]?.length || 0
        const artwork = await Artwork.create({
          slug: work.id,
          categoryId: category._id,
          collectionId: collection._id,
          title: work.title,
          artist: work.artist || '',
          year: work.year,
          ratio: work.ratio ?? 0.8,
          image: { gradient: work.image?.gradient || '', alt: work.image?.alt || '', src: '' },
          order: positionInCategory++,
          noteCount,
        })
        artCount++
        artworkBySlug.set(work.id, artwork._id)
      }
    }
  }

  // Seed notes (preserve their original timestamps via a raw insert).
  const noteDocs = []
  for (const [slug, notes] of Object.entries(seedNotes)) {
    const artworkId = artworkBySlug.get(slug)
    if (!artworkId) continue
    for (const n of notes) {
      const created = new Date(n.createdAt)
      noteDocs.push({
        artworkId,
        userId: null,
        author: n.author,
        text: n.text,
        createdAt: created,
        updatedAt: created,
      })
    }
  }
  if (noteDocs.length) await Note.collection.insertMany(noteDocs)

  console.log(
    `[seed] done: ${catCount} categories, ${colCount} collections, ${artCount} artworks, ${noteDocs.length} notes`
  )
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
