/**
 * Builds the Sets of artwork ids the current user has saved / liked, so
 * serializers can set `saved` and `liked`. Returns empty Sets when there is
 * no authenticated user (public browsing).
 */
import { Save } from '../models/Save.js'
import { Like } from '../models/Like.js'

export async function interactionSets(userId, artworkIds) {
  if (!userId || artworkIds.length === 0) {
    return { savedIds: new Set(), likedIds: new Set() }
  }
  const [saves, likes] = await Promise.all([
    Save.find({ userId, artworkId: { $in: artworkIds } }, 'artworkId').lean(),
    Like.find({ userId, artworkId: { $in: artworkIds } }, 'artworkId').lean(),
  ])
  return {
    savedIds: new Set(saves.map((s) => String(s.artworkId))),
    likedIds: new Set(likes.map((l) => String(l.artworkId))),
  }
}
