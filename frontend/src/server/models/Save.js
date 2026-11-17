import mongoose from 'mongoose'

const saveSchema = new mongoose.Schema(
  {
    artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
)

// A user can save an artwork at most once (their favourites folder).
saveSchema.index({ artworkId: 1, userId: 1 }, { unique: true })

// Reuse the compiled model across dev hot-reloads.
export const Save = mongoose.models.Save || mongoose.model('Save', saveSchema)
