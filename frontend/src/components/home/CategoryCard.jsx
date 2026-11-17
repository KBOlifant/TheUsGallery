import { forwardRef } from 'react'
import Link from 'next/link'

/**
 * Full-screen category slide. The active slide links into the category;
 * a neighbour peeking in mid-drag is a button that selects it.
 */
export const CategoryCard = forwardRef(function CategoryCard({ category, active, onSelect, onClickCapture, onEnter }, ref) {
  const inner = (
    <div className="group relative size-full overflow-hidden">
      <div
        className="absolute inset-0 transition-transform duration-[1400ms] ease-aperture group-hover:scale-[1.03]"
        style={{ background: category.cover, backgroundSize: 'cover', backgroundPosition: 'center' }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-ink/0 to-ink/80" aria-hidden="true" />

      <span className="absolute top-5 right-6 px-2 py-1 text-[10px] tracking-[0.2em] text-paper light:bg-accent light:text-on-accent md:right-12">{category.index}</span>
      <div className="px-page absolute inset-x-0 bottom-0 flex flex-col gap-3 pb-8 text-paper md:pb-12">
        <span className="text-[10px] uppercase tracking-[0.22em]">{category.eyebrow}</span>
        <div className="flex items-end justify-between gap-6">
          <span className="font-display text-[clamp(3.5rem,9vw,9rem)] leading-[0.9]">{category.name}</span>
          <span className="shrink-0 pb-2 text-[10px] uppercase tracking-[0.22em]">{category.workCount} works</span>
        </div>
      </div>
    </div>
  )

  const className = 'block size-full text-left'

  return active ? (
    <Link ref={ref} href={`/collections/${category.id}`} draggable={false} className={className} onClickCapture={onClickCapture} onClick={onEnter}>
      {inner}
    </Link>
  ) : (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      onClickCapture={onClickCapture}
      className={className}
      aria-label={`Show ${category.name}`}
    >
      {inner}
    </button>
  )
})
