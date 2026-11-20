import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from './Icon'
import { MODES, PALETTES, VIEWS, useTheme } from '../../theme/ThemeProvider'

const MODE_ICONS = { dark: 'moon', light: 'sun' }
const VIEW_ICONS = { single: 'rows', multi: 'grid' }

// flex-1 + justify-center: the Mode and Palette rows share one track width (the parent
// flex-col stretches both to the widest row), so without flex-1 a row with fewer/narrower
// chips than the other leaves dead space the active pill doesn't cover.
const chip = 'inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-full px-3 text-[10px] uppercase tracking-[0.18em] transition-colors duration-300'

/** One icon button that opens the theme options: light/dark mode and colour palette. */
export function ThemeSwitcher() {
  const { mode, setMode, palette, setPalette, view, setView } = useTheme()
  const [open, setOpen] = useState(false)
  const root = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label="Theme"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-text transition-colors duration-300 hover:border-text"
      >
        <Icon name="palette" size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Theme"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full z-40 mt-2 flex w-max flex-col gap-4 border border-line bg-ground p-4 shadow-lg"
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Mode</span>
              <div role="group" aria-label="Mode" className="flex gap-1 rounded-full border border-line-strong p-1">
                {MODES.map((m) => {
                  const active = m.id === mode
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={m.label}
                      onClick={() => setMode(m.id)}
                      className={`${chip} ${active ? 'bg-raised text-text' : 'text-muted hover:text-text'}`}
                    >
                      {/* Sun / moon icon always; the word joins it on larger screens. */}
                      <Icon name={MODE_ICONS[m.id]} size={14} />
                      <span className="max-sm:sr-only">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Palette</span>
              <div role="group" aria-label="Colour palette" className="flex gap-1 rounded-full border border-line-strong p-1">
                {PALETTES.map((p) => {
                  const active = p.id === palette
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={p.label}
                      onClick={() => setPalette(p.id)}
                      className={`${chip} ${active ? 'bg-raised text-text' : 'text-muted hover:text-text'}`}
                    >
                      <span className="size-2.5 rounded-full" style={{ background: p.dot }} aria-hidden="true" />
                      <span className="max-sm:sr-only">{p.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted">View</span>
              <div role="group" aria-label="View" className="flex gap-1 rounded-full border border-line-strong p-1">
                {VIEWS.map((v) => {
                  const active = v.id === view
                  return (
                    <button
                      key={v.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={v.label}
                      onClick={() => setView(v.id)}
                      className={`${chip} ${active ? 'bg-raised text-text' : 'text-muted hover:text-text'}`}
                    >
                      <Icon name={VIEW_ICONS[v.id]} size={14} />
                      <span className="max-sm:sr-only">{v.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
