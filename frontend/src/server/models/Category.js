import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // the "id" in the API contract
    name: { type: String, required: true },
    eyebrow: { type: String, default: '' },
    title: { type: String, default: '' },
    intro: { type: String, default: '' },
    order: { type: Number, default: 0 }, // serialized as a zero-padded "index" string
    cover: { type: String, default: '' }, // CSS gradient fallback
    bannerUrl: { type: String, default: '' }, // Cloudinary banner image, if any
    bannerPublicId: { type: String, default: '' }, // Cloudinary public_id (for deletion)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

// Reuse the compiled model across dev hot-reloads.
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema)
