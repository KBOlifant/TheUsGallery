import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { AuthModal } from './AuthModal'
import { useAuth } from '../../auth/AuthProvider'

/** Header widget: Sign in button when logged out; name + status + sign out when logged in. */
export function AccountControl() {
  const { loading, isAuthed, isAdmin, isApproved, user, profile, status, logout } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) return <div className="h-11 w-24" aria-hidden="true" />

  if (!isAuthed) {
    return (
      <>
        <Button icon="log-in" className="rounded-full" onClick={() => setModalOpen(true)}>
          Sign in
        </Button>
        <AnimatePresence>{modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}</AnimatePresence>
      </>
    )
  }

  const name = profile?.displayName || user?.displayName || user?.email || 'Member'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="label flex h-11 items-center gap-3 rounded-full border border-line-strong px-5 text-text transition-colors duration-300 hover:border-text"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <span className="max-w-[12ch] truncate">{name}</span>
        {status !== 'approved' && (
          <span className="rounded-full border border-accent px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-accent">
            {status === 'pending' ? 'Pending' : status}
          </span>
        )}
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 border border-line bg-ground p-2 shadow-lg"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <div className="px-3 py-2 text-[11px] text-muted">
            {user?.email}
            {status === 'pending' && <span className="mt-1 block text-accent">Awaiting admin approval</span>}
          </div>
          {isApproved && (
            <Link
              href="/upload"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-[13px] text-text transition-colors hover:bg-line/40"
            >
              Upload Memories
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-[13px] text-text transition-colors hover:bg-line/40"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false)
              logout()
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-text transition-colors hover:bg-line/40"
          >
            <Icon name="log-out" size={14} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
