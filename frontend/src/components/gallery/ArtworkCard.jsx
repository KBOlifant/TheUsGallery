import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fadeUp } from '../../lib/motion'
import { setNavIntent } from '../../lib/navIntent'
import { formatTakenDate, pad2 } from '../../lib/format'
import { removeArtwork, toggleLiked, toggleSaved, useArtworkState } from '../../lib/artworkStore'
import { ArtImage } from '../ui/ArtImage'
import { IndexChip } from '../ui/Bits'
import { Icon } from '../ui/Icon'
import { IconButton } from '../ui/Button'

export const artworkPath = (work) => `/collections/${work.categoryId}/works/${work.id}`

/**
 * Portrait artwork card.
 * `layout="row"` (default): width scales with the image ratio so a scrolling row feels hung, not gridded.
 * `layout="grid"`: fills its grid cell instead — see ArtworkGrid.jsx (the multi-line view).
 */
export function ArtworkCard({ artwork, number, layout = 'row' }) {
  const work = useArtworkState(artwork)
  const router = useRouter()
  const to = artworkPath(work)
  const widthScale = Math.sqrt(work.ratio / 0.8).toFixed(3)
  const isGrid = layout === 'grid'
  // Screen-reader name that doesn't reveal the image's file name.
  const label = `work ${pad2(number)}, ${formatTakenDate(work)}`

  const handleDelete = async () => {
    if (!window.confirm('Delete this photo? This cannot be undone.')) return
    try {
      await removeArtwork(work.id)
    } catch (err) {
      window.alert(err.message || 'Could not delete this photo.')
    }
  }

  return (
    <motion.li
      variants={fadeUp}
      className={`group relative flex flex-col gap-3.5 ${layout === 'row' ? 'shrink-0 snap-start' : ''}`}
      style={layout === 'row' ? { width: `calc(${widthScale} * var(--card-w))` } : undefined}
    >
      <div className="relative border border-line" style={{ aspectRatio: work.ratio }}>
        <ArtImage image={work.image} className="absolute inset-0" />
        <IndexChip className="absolute top-3 left-3">{pad2(number)}</IndexChip>

        <button
          type="button"
          aria-pressed={work.liked}
          aria-label={work.liked ? `Unlike ${label}` : `Like ${label}`}
          onClick={() => toggleLiked(work).catch(() => {})}
          className={`absolute top-3 right-3 z-10 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-colors duration-300 ${
            work.liked ? 'text-red-500' : 'text-paper/90 hover:text-paper'
          }`}
        >
          <Icon name="heart" size={20} filled={work.liked} />
        </button>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          {isGrid && work.dislikeCount > 0 && (
            <span className="text-[11px] tracking-[0.08em] text-muted" aria-label={`${work.dislikeCount} dislikes`}>
              <span aria-hidden="true">🍅 {work.dislikeCount}</span>
            </span>
          )}
          <h3 className={`font-display leading-[1.15] ${isGrid ? 'text-[15px] sm:text-[22px]' : 'text-[22px]'}`}>
            {/* Stretched link: the whole card opens the work; buttons sit above it. */}
            {/* scroll={false}: the gallery stays put under the modal. */}
            <Link
              href={to}
              scroll={false}
              onClick={() => setNavIntent(work.id)}
              aria-label={`Open ${label}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {/* Image names stay private; only the year (from metadata) is shown. */}
              {formatTakenDate(work)}
            </Link>
          </h3>
        </div>

        <div className={`relative z-10 flex gap-1.5 pt-1 ${isGrid ? 'hidden sm:flex' : ''}`}>
          <IconButton
            size="sm"
            icon="heart"
            active={work.saved}
            aria-pressed={work.saved}
            aria-label={work.saved ? `Remove ${label} from saved` : `Save ${label}`}
            onClick={() => toggleSaved(work).catch(() => {})}
          />
          <button
            type="button"
            onClick={() => {
              setNavIntent(work.id, { focusNotes: true })
              router.push(to, { scroll: false })
            }}
            aria-label={`${work.noteCount} visitor notes on ${label}`}
            className="relative inline-flex h-7 min-w-7 items-center justify-center gap-1 border border-line-strong px-1.5 text-[10px] text-text transition-colors duration-300 hover:border-text before:absolute before:-inset-2 before:content-['']"
          >
            <Icon name="comment" size={13} />
            {work.noteCount > 0 && <span className="tabular-nums">{work.noteCount}</span>}
          </button>
          {work.canDelete && (
            <IconButton size="sm" icon="trash" aria-label={`Delete ${label}`} onClick={handleDelete} />
          )}
        </div>
      </div>
    </motion.li>
  )
}
