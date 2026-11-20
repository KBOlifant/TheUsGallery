import { motion } from 'framer-motion'
import { fadeUp, inView, stagger } from '../../lib/motion'
import { useTheme } from '../../theme/ThemeProvider'
import { Eyebrow } from '../ui/Bits'
import { ArtworkRow } from './ArtworkRow'
import { ArtworkGrid } from './ArtworkGrid'

export function CollectionSection({ collection }) {
  const { view } = useTheme()
  const headingId = `collection-${collection.id}`

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-10 pt-section first:pt-24">
      <motion.header
        variants={stagger(0.1)}
        {...inView}
        className="px-page flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div className="flex flex-col gap-6" data-scroll data-scroll-speed="0.04">
          <motion.div variants={fadeUp}>
            <Eyebrow>
              {collection.eyebrow} · {collection.index}
            </Eyebrow>
          </motion.div>
          <motion.h2 id={headingId} variants={fadeUp} className="font-display text-display-l">
            {collection.title}
          </motion.h2>
        </div>
        <motion.p variants={fadeUp} className="max-w-xs text-caption text-muted md:pb-2">
          {collection.description}
        </motion.p>
      </motion.header>

      <hr className="border-line" />

      {view === 'multi' ? (
        <ArtworkGrid works={collection.works} label={collection.title} />
      ) : (
        <ArtworkRow works={collection.works} label={collection.title} />
      )}
    </section>
  )
}
