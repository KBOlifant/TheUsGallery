import mongoose from 'mongoose'

const artworkSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // the "id" in the API contract
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true, index: true },
    title: { type: String, required: true },
    artist: { type: String, default: '' },
    year: { type: Number },
    ratio: { type: Number, default: 0.8 }, // width / height
    image: {
      src: { type: String, default: '' }, // Cloudinary URL
      publicId: { type: String, default: '' }, // Cloudinary public_id (for deletion)
      gradient: { type: String, default: '' }, // CSS placeholder
      alt: { type: String, default: '' },
    },
    order: { type: Number, default: 0 }, // position within its collection
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Denormalized counts so list endpoints avoid N+1 queries.
    likeCount: { type: Number, default: 0 },
    noteCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Reuse the compiled model across dev hot-reloads.
export const Artwork = mongoose.models.Artwork || mongoose.model('Artwork', artworkSchema)
