import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { AuthModal } from './AuthModal'
import { useAuth } from '../../auth/AuthProvider'

/** Shown when someone without an approved account tries to go past the home carousel. */
export function AccessModal({ onClose }) {
  const { isAuthed, status, logout } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !signInOpen && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, signInOpen])

  const copy = !isAuthed
    ? {
        title: 'Members only',
        body: 'The gallery is open to signed-in members. You can browse the categories here, but to step inside you’ll need to sign in or create an account.',
      }
    : status === 'pending'
      ? {
          title: 'Awaiting approval',
          body: 'Your account is waiting for an admin to approve it. Once you’re approved you’ll be able to enter the gallery.',
        }
      : {
          title: 'Access not granted',
          body: 'This account hasn’t been approved for the gallery. Sign in with a different account to continue.',
        }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={copy.title}
          className="w-full max-w-md border border-line bg-ground p-8"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-display text-[28px] leading-none text-text">{copy.title}</h2>
          <p className="mt-3 text-[13px] text-muted">{copy.body}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {!isAuthed ? (
              <Button variant="accent" onClick={() => setSignInOpen(true)}>
                Sign in or sign up
              </Button>
            ) : (
              <Button
                variant="accent"
                onClick={async () => {
                  await logout()
                  setSignInOpen(true)
                }}
              >
                Switch account
              </Button>
            )}
            <Button onClick={onClose}>Back to categories</Button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {signInOpen && (
          <AuthModal
            onClose={() => {
              setSignInOpen(false)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
