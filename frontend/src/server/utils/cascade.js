/** Cascade-delete helpers so removing a category/collection cleans up dependents. */
import { Artwork } from '../models/Artwork.js'
import { Note } from '../models/Note.js'
import { Like } from '../models/Like.js'
import { Save } from '../models/Save.js'
import { deleteImage } from '../cloudinary.js'

/** Delete all artworks matching `filter`, plus their notes/likes/saves and Cloudinary images. */
export async function deleteArtworks(filter) {
  const arts = await Artwork.find(filter, '_id image.publicId').lean()
  if (arts.length === 0) return 0
  const ids = arts.map((a) => a._id)

  await Promise.all([
    Note.deleteMany({ artworkId: { $in: ids } }),
    Like.deleteMany({ artworkId: { $in: ids } }),
    Save.deleteMany({ artworkId: { $in: ids } }),
  ])
  for (const a of arts) {
    if (a.image?.publicId) {
      try {
        await deleteImage(a.image.publicId)
      } catch {
        /* best-effort */
      }
    }
  }
  await Artwork.deleteMany({ _id: { $in: ids } })
  return ids.length
}
