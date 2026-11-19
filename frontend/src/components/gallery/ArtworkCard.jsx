import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fadeUp } from '../../lib/motion'
import { setNavIntent } from '../../lib/navIntent'
import { formatTakenDate, pad2 } from '../../lib/format'
import { toggleSaved, useArtworkState } from '../../lib/artworkStore'
import { ArtImage } from '../ui/ArtImage'
import { IndexChip } from '../ui/Bits'
import { Icon } from '../ui/Icon'
import { IconButton } from '../ui/Button'

export const artworkPath = (work) => `/collections/${work.categoryId}/works/${work.id}`

/** Portrait artwork card. Width scales with the image ratio so rows feel hung, not gridded. */
export function ArtworkCard({ artwork, number }) {
  const work = useArtworkState(artwork)
  const router = useRouter()
  const to = artworkPath(work)
  const widthScale = Math.sqrt(work.ratio / 0.8).toFixed(3)
  // Screen-reader name that doesn't reveal the image's file name.
  const label = `work ${pad2(number)}, ${formatTakenDate(work)}`

  return (
    <motion.li
      variants={fadeUp}
      className="group relative flex shrink-0 snap-start flex-col gap-3.5"
      style={{ width: `calc(${widthScale} * var(--card-w))` }}
    >
      <div className="relative border border-line" style={{ aspectRatio: work.ratio }}>
        <ArtImage image={work.image} className="absolute inset-0" />
        <IndexChip className="absolute top-3 left-3">{pad2(number)}</IndexChip>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="font-display text-[22px] leading-[1.15]">
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

        <div className="relative z-10 flex gap-1.5 pt-1">
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
        </div>
      </div>
    </motion.li>
  )
}
