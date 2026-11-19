import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { clearNavIntent, readNavIntent } from '../../lib/navIntent'
import { addNote, getArtwork, getNotes } from '../../functions/api'
import { patchArtwork, toggleSaved, toggleLiked, useArtworkState } from '../../lib/artworkStore'
import { useAuth } from '../../auth/AuthProvider'
import { ease, transition } from '../../lib/motion'
import { lockScroll, unlockScroll } from '../../lib/scroll'
import { useAsync } from '../../lib/useAsync'
import { ArtImage } from '../ui/ArtImage'
import { Counter, Eyebrow } from '../ui/Bits'
import { Button, IconButton } from '../ui/Button'
import { VisitorNotes } from './VisitorNotes'
import { MetaToggle } from './MetaToggle'
import { formatTakenDate, formatTakenTime } from '../../lib/format'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])'

/** Two-pane work detail dialog over a blurred backdrop. Rendered above the gallery route. */
export function ArtworkModal({ categoryId, workId }) {
  const router = useRouter()
  const { isAuthed, isApproved } = useAuth()
  const dialog = useRef(null)
  const closeBtn = useRef(null)
  // Captured once on open; null when the work was opened by direct link.
  const [intent] = useState(() => readNavIntent(workId))
  const focusNotes = Boolean(intent?.focusNotes)

  const art = useAsync(() => getArtwork(workId), [workId])
  const notes = useAsync(() => getNotes(workId), [workId])
  const work = useArtworkState(art.data)

  const close = () => {
    clearNavIntent()
    if (intent?.fromGallery) router.back()
    else router.replace(`/collections/${categoryId}`, { scroll: false })
  }

  // Freeze the page scroll while open; restore focus to where it was on close.
  useEffect(() => {
    const previous = document.activeElement
    lockScroll()
    if (!focusNotes) closeBtn.current?.focus()
    return () => {
      unlockScroll()
      previous?.focus?.()
    }
  }, [focusNotes])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
      return
    }
    if (e.key !== 'Tab') return
    const items = [...dialog.current.querySelectorAll(FOCUSABLE)]
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const handleAddNote = async (text) => {
    const note = await addNote(workId, { text })
    notes.setData((list) => [...(list ?? []), note])
    patchArtwork(workId, { noteCount: (notes.data?.length ?? 0) + 1 })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onKeyDown={onKeyDown}>
      <motion.div
        className="absolute inset-0 bg-ink/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
        onClick={close}
        aria-hidden="true"
      />

      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-title"
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 48 }}
        transition={{ duration: 0.7, ease }}
        data-lenis-prevent
        className="relative flex h-full w-full flex-col overflow-y-auto border-line bg-ground lg:m-[2vh] lg:mr-[2vw] lg:h-[96vh] lg:w-[min(1100px,94vw)] lg:flex-row lg:overflow-hidden lg:border"
      >
        {/* Image pane */}
        <div className="flex shrink-0 flex-col gap-3 p-5 lg:w-[52%] lg:p-6">
          <div className="flex min-h-[50vh] flex-1 items-center justify-center lg:min-h-0">
            {work ? (
              <motion.div
                className="w-full max-h-full"
                style={{ aspectRatio: work.ratio }}
                initial={{ scale: 1.04, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, ease }}
              >
                <ArtImage image={work.image} hoverZoom={false} className="size-full" />
              </motion.div>
            ) : (
              <div className="aspect-[3/4] w-full bg-surface" aria-hidden="true" />
            )}
          </div>
          <div className="flex justify-end text-[10px] tracking-[0.18em] text-muted">
            {work && <Counter current={work.position} total={work.total} className="text-[10px]" />}
          </div>
        </div>

        {/* Details pane */}
        <div data-lenis-prevent className="relative flex flex-1 flex-col gap-8 bg-surface p-6 pt-20 lg:overflow-y-auto lg:border-l lg:border-line lg:p-8 lg:pt-20">
          <IconButton ref={closeBtn} icon="close" aria-label="Close" onClick={close} className="absolute top-5 right-5" />

          {art.error ? (
            <div className="flex flex-col gap-4">
              <Eyebrow>Not found</Eyebrow>
              <p className="text-body text-muted">We couldn’t find this work. It may have been moved.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <Eyebrow>Selected work</Eyebrow>
                <h2 id="artwork-title" className="font-display text-[clamp(2.5rem,4.2vw,4rem)] leading-[1.05]">
                  {/* Image names stay private; the name is only shown under "Show meta". */}
                  {work ? formatTakenDate(work) : <span className="text-muted">Loading…</span>}
                </h2>
                {work && formatTakenTime(work) && (
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{formatTakenTime(work)}</p>
                )}
                {work && <MetaToggle meta={work.meta} name={work.title} />}
              </div>

              {work && isApproved && (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={work.saved ? 'accent' : 'outline'}
                    icon="heart"
                    iconFilled={work.saved}
                    aria-pressed={work.saved}
                    onClick={() => toggleSaved(work).catch(() => {})}
                  >
                    {work.saved ? 'Saved' : 'Save this work'}
                  </Button>
                  <Button
                    variant={work.liked ? 'accent' : 'outline'}
                    aria-pressed={work.liked}
                    onClick={() => toggleLiked(work).catch(() => {})}
                  >
                    {work.liked ? 'Liked' : 'Like'}
                    {work.likeCount > 0 && <span className="text-muted">· {work.likeCount}</span>}
                  </Button>
                </div>
              )}

              {work && !isApproved && (
                <p className="text-[13px] text-muted">
                  {isAuthed
                    ? 'Your account is pending approval — you can browse for now.'
                    : 'Sign in (top right) to save, like and comment.'}
                  {work.likeCount > 0 && <span className="ml-2 text-muted">· {work.likeCount} likes</span>}
                </p>
              )}

              <VisitorNotes
                notes={notes.data ?? []}
                loading={notes.loading}
                onAdd={handleAddNote}
                autoFocusInput={focusNotes}
                canComment={isApproved}
                authPrompt={isAuthed ? 'pending' : 'signin'}
              />
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
