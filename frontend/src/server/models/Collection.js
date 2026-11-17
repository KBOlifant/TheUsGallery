import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true }, // the "id" in the API contract
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    eyebrow: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

// slug unique within a category (not globally)
collectionSchema.index({ categoryId: 1, slug: 1 }, { unique: true })

// Reuse the compiled model across dev hot-reloads.
export const Collection = mongoose.models.Collection || mongoose.model('Collection', collectionSchema)
