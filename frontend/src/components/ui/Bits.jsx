import { motion } from 'framer-motion'
import { transition } from '../../lib/motion'
import { pad2 } from '../../lib/format'

/** 1px track with an accent fill. `value` is 0–1. */
export function ProgressBar({ value, className = '' }) {
  return (
    <div className={`relative h-px bg-line ${className}`} aria-hidden="true">
      <motion.div className="absolute inset-y-0 left-0 bg-accent" animate={{ width: `${value * 100}%` }} transition={transition} />
    </div>
  )
}

/** "02 / 05" in label style. */
export function Counter({ current, total, className = '' }) {
  return (
    <span className={`text-[11px] tracking-[0.22em] text-muted tabular-nums ${className}`}>
      {pad2(current)} / {pad2(total)}
    </span>
  )
}

/** Frosted number chip that sits top-left on artwork. */
export function IndexChip({ children, className = '' }) {
  return (
    <span
      className={`inline-flex h-5 min-w-7 items-center justify-center border border-paper/25 bg-ink/55 px-1 text-[10px] tracking-[0.14em] text-paper backdrop-blur-sm light:border-accent light:bg-accent light:text-on-accent ${className}`}
    >
      {children}
    </span>
  )
}

/** Initial avatar for visitor notes. */
export function Avatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-raised font-display text-[13px] text-text"
    >
      {name?.[0]?.toUpperCase() ?? '·'}
    </span>
  )
}

export function CountBadge({ children, label }) {
  return (
    <span
      aria-label={label}
      className="inline-flex h-6 min-w-6 items-center justify-center border border-line-strong px-1.5 text-[10px] tracking-[0.1em] text-text"
    >
      {children}
    </span>
  )
}

/** Tracked uppercase metadata line. */
export function Eyebrow({ children, className = '', as: Tag = 'p' }) {
  return <Tag className={`label text-muted light:text-eyebrow ${className}`}>{children}</Tag>
}
