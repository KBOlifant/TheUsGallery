'use client'

import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { AccessModal } from './AccessModal'

/**
 * Wraps the gallery routes. Approved members see the gallery; everyone else
 * (signed out, pending, rejected) gets the access modal instead and is sent
 * back to the home carousel when they dismiss it.
 */
export function GalleryGate({ children }) {
  const { loading, isApproved } = useAuth()
  const router = useRouter()

  if (loading) return <div className="min-h-svh" aria-busy="true" />

  if (!isApproved) {
    return (
      <div className="min-h-svh">
        <AnimatePresence>
          <AccessModal onClose={() => router.replace('/')} />
        </AnimatePresence>
      </div>
    )
  }

  return children
}
