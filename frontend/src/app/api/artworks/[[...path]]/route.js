import { resource, route } from '@/server/http'
import { createArtwork, getArtwork, getNotes, addNote } from '@/server/controllers/artworks'
import { like, unlike, setSaved, unsetSaved } from '@/server/controllers/interactions'

// All /api/artworks/* endpoints.
const handle = resource([
  ['POST', '/', route(createArtwork, { access: 'approved', file: 'image' })],
  ['GET', '/:id', route(getArtwork, { access: 'approved' })],
  ['GET', '/:id/notes', route(getNotes, { access: 'approved' })],
  ['POST', '/:id/notes', route(addNote, { access: 'approved' })],
  ['PUT', '/:id/save', route(setSaved, { access: 'approved' })],
  ['DELETE', '/:id/save', route(unsetSaved, { access: 'approved' })],
  ['PUT', '/:id/like', route(like, { access: 'approved' })],
  ['DELETE', '/:id/like', route(unlike, { access: 'approved' })],
])

export { handle as GET, handle as POST, handle as PUT, handle as DELETE }
