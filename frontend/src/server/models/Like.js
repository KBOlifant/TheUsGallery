import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema(
  {
    artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
)

// A user can like an artwork at most once.
likeSchema.index({ artworkId: 1, userId: 1 }, { unique: true })

// Reuse the compiled model across dev hot-reloads.
export const Like = mongoose.models.Like || mongoose.model('Like', likeSchema)
