import { AnimatePresence, motion } from 'framer-motion'
import { timeAgo } from '../../lib/format'
import { transition } from '../../lib/motion'
import { Avatar, CountBadge } from '../ui/Bits'
import { NoteInput } from '../ui/NoteInput'

export function VisitorNotes({ notes, loading, onAdd, autoFocusInput, canComment = true, authPrompt = 'signin' }) {
  return (
    <section aria-labelledby="visitor-notes" className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-t border-line pt-8">
        <h3 id="visitor-notes" className="label">
          Visitor notes
        </h3>
        <CountBadge label={`${notes.length} notes`}>{notes.length}</CountBadge>
      </div>

      {loading ? (
        <p className="text-caption text-muted">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="text-body text-muted">No notes yet. Be the first to leave one.</p>
      ) : (
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {notes.map((n) => (
              <motion.li
                key={n.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
                className="flex gap-3.5 border-b border-line py-4"
              >
                <Avatar name={n.author} />
                <div className="flex flex-col gap-1">
                  <p className="text-[13px] leading-relaxed">{n.text}</p>
                  <p className="text-[11px] text-muted">
                    <span className="sr-only">{n.author}, </span>
                    <time dateTime={n.createdAt}>{timeAgo(n.createdAt)}</time>
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {canComment ? (
        <NoteInput onSubmit={onAdd} autoFocus={autoFocusInput} />
      ) : (
        <p className="text-caption text-muted">
          {authPrompt === 'pending'
            ? 'Your account is pending approval before you can leave a note.'
            : 'Sign in to leave a note.'}
        </p>
      )}
    </section>
  )
}
