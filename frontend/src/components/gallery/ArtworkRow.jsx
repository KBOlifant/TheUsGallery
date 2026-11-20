import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { inView, stagger } from '../../lib/motion'
import { useVisibleWorks } from '../../lib/artworkStore'
import { IconButton } from '../ui/Button'
import { ArtworkCard } from './ArtworkCard'

/** A row of artworks that scrolls sideways and bleeds off the right edge. */
export function ArtworkRow({ works: allWorks, label }) {
  const works = useVisibleWorks(allWorks) // drops anything just deleted locally
  const scroller = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  useEffect(() => {
    const el = scroller.current
    const update = () =>
      setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 })
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  const page = (dir) => {
    const el = scroller.current
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-8">
      <motion.ul
        ref={scroller}
        aria-label={label}
        variants={stagger(0.08)}
        {...inView}
        className="px-page no-scrollbar flex snap-x snap-mandatory scroll-px-5 items-start gap-6 overflow-x-auto pb-2 [--card-w:clamp(220px,62vw,300px)] md:scroll-px-10 md:[--card-w:clamp(240px,24vw,400px)] xl:scroll-px-24"
      >
        {works.map((w, i) => (
          <ArtworkCard key={w.id} artwork={w} number={i + 1} />
        ))}
      </motion.ul>

      <div className="px-page">
        <div className="flex items-center justify-between border-t border-line pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{works.length} works in this collection</p>
          <div className="flex gap-3">
            <IconButton icon="arrow-left" aria-label={`Scroll ${label} back`} onClick={() => page(-1)} disabled={edges.start} />
            <IconButton icon="arrow-right" aria-label={`Scroll ${label} forward`} onClick={() => page(1)} disabled={edges.end} />
          </div>
        </div>
      </div>
    </div>
  )
}
