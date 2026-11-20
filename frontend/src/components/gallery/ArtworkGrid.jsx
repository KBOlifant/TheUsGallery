import { motion } from 'framer-motion'
import { inView, stagger } from '../../lib/motion'
import { useVisibleWorks } from '../../lib/artworkStore'
import { ArtworkCard } from './ArtworkCard'

/**
 * The "multi-line" view: a collection's works wrap onto as many rows as they need,
 * 3 per row on every screen size, instead of one scrolling row.
 */
export function ArtworkGrid({ works: allWorks, label }) {
  const works = useVisibleWorks(allWorks) // drops anything just deleted locally

  return (
    <div className="flex flex-col gap-8">
      <motion.ul
        aria-label={label}
        variants={stagger(0.08)}
        {...inView}
        className="px-page grid grid-cols-3 gap-x-3 gap-y-10 sm:gap-x-6"
      >
        {works.map((w, i) => (
          <ArtworkCard key={w.id} artwork={w} number={i + 1} layout="grid" />
        ))}
      </motion.ul>

      <div className="px-page">
        <p className="border-t border-line pt-6 text-[10px] uppercase tracking-[0.2em] text-muted">
          {works.length} works in this collection
        </p>
      </div>
    </div>
  )
}
