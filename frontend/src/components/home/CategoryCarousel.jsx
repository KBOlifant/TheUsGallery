import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import { CategoryCard } from './CategoryCard'
import { Counter, ProgressBar } from '../ui/Bits'
import { IconButton, TextLink } from '../ui/Button'
import { transition } from '../../lib/motion'

/**
 * Full-screen category carousel: one slide fills the stage. Buttons, arrow keys
 * or drag/swipe to move. Fills its parent's height (parent must be a flex column
 * with a fixed height); `overlay` is drawn over the stage (the hero headline).
 */
export function CategoryCarousel({ categories, initialIndex = 1, overlay, onEnter }) {
  const [index, setIndex] = useState(Math.min(initialIndex, categories.length - 1))
  const viewport = useRef(null)
  const cards = useRef([])
  const dragged = useRef(false)
  const x = useMotionValue(0)

  // Each slide is exactly one viewport wide, so slide i sits at -offsetLeft.
  const targetX = useCallback((i) => -(cards.current[i]?.offsetLeft ?? 0), [])

  const indexRef = useRef(index)

  const goTo = useCallback(
    (i) => {
      const next = Math.max(0, Math.min(categories.length - 1, i))
      indexRef.current = next
      setIndex(next)
      animate(x, targetX(next), transition)
    },
    [categories.length, targetX, x],
  )

  // Position on mount and keep it aligned on resize (no animation).
  useLayoutEffect(() => {
    const align = () => x.set(targetX(indexRef.current))
    align()
    const ro = new ResizeObserver(align)
    ro.observe(viewport.current)
    return () => ro.disconnect()
  }, [targetX, x])

  const onDragEnd = (_, info) => {
    const swipe = info.offset.x + info.velocity.x * 0.2
    if (swipe < -80) goTo(index + 1)
    else if (swipe > 80) goTo(index - 1)
    else goTo(index)
    // Swallow the click that follows a drag.
    setTimeout(() => (dragged.current = false), 0)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(index - 1)
    }
  }

  const active = categories[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Categories"
      onKeyDown={onKeyDown}
      className="flex min-h-0 flex-1 flex-col"
    >
      {/* Stage: slides fill all the space between the header and the control bar. */}
      <div className="relative min-h-0 flex-1">
        {/* @container so each slide can be exactly one stage wide (100cqw). */}
        <div ref={viewport} className="@container absolute inset-0 overflow-hidden">
          <motion.ul
            style={{ x }}
            drag="x"
            dragMomentum={false}
            dragElastic={0.12}
            onDragStart={() => (dragged.current = true)}
            onDragEnd={onDragEnd}
            className="flex h-full w-max cursor-grab active:cursor-grabbing"
          >
            {categories.map((c, i) => (
              <li
                key={c.id}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${categories.length}`}
                aria-current={i === index ? 'true' : undefined}
                className="h-full w-[100cqw] shrink-0"
              >
                <CategoryCard
                  ref={(el) => (cards.current[i] = el)}
                  category={c}
                  active={i === index}
                  onSelect={() => goTo(i)}
                  onEnter={onEnter}
                  onClickCapture={(e) => {
                    if (dragged.current) {
                      e.preventDefault()
                      e.stopPropagation()
                    }
                  }}
                />
              </li>
            ))}
          </motion.ul>
        </div>
        {overlay}
      </div>

      <div className="px-page flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line bg-ground py-4">
        <div className="flex w-full min-w-0 flex-1 items-center gap-6 md:w-auto md:max-w-3xl">
          <ProgressBar value={(index + 1) / categories.length} className="flex-1" />
          <Counter current={index + 1} total={categories.length} />
          <div className="flex gap-3">
            <IconButton icon="arrow-left" aria-label="Previous category" onClick={() => goTo(index - 1)} disabled={index === 0} />
            <IconButton
              icon="arrow-right"
              aria-label="Next category"
              onClick={() => goTo(index + 1)}
              disabled={index === categories.length - 1}
            />
          </div>
        </div>

        <div className="md:ml-auto" aria-live="polite">
          <TextLink to={`/collections/${active.id}`} onClick={onEnter}>Enter {active.name.toLowerCase()} collection</TextLink>
        </div>
      </div>
    </section>
  )
}
