import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for seed notes
    author: { type: String, required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
)

// Reuse the compiled model across dev hot-reloads.
export const Note = mongoose.models.Note || mongoose.model('Note', noteSchema)
