'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { getCategories } from '../functions/api'
import { useAuth } from '../auth/AuthProvider'
import { AccessModal } from '../components/auth/AccessModal'
import { useLenis } from '../lib/scroll'
import { useAsync } from '../lib/useAsync'
import { Header } from '../components/layout/Header'
import { Hero } from '../components/home/Hero'
import { CategoryCarousel } from '../components/home/CategoryCarousel'

/** The hero headline sits over the full-screen slides, so it uses fixed light text on a dark scrim. */
const heroOverlay = (
  <div
    className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-linear-to-b from-ink/70 to-transparent pb-10"
    style={{ '--text': '#eceae4', '--muted': '#d6d3cb' }}
  >
    <Hero />
  </div>
)

export function HomePage() {
  useLenis()
  const { data: categories, error } = useAsync(getCategories, [])
  const { isApproved } = useAuth()
  const [gateOpen, setGateOpen] = useState(false)

  // Only approved members may go past the carousel; everyone else gets the access modal.
  const onEnter = (e) => {
    if (isApproved) return
    e.preventDefault()
    setGateOpen(true)
  }

  return (
    // One screen: header, full-screen carousel, control bar.
    <div className="flex h-svh flex-col overflow-hidden">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        {categories ? (
          <CategoryCarousel categories={categories} overlay={heroOverlay} onEnter={onEnter} />
        ) : (
          <div
            className="relative flex-1 bg-surface"
            aria-busy={!error}
            aria-label={error ? undefined : 'Loading categories'}
          >
            {error ? (
              <p role="alert" className="px-page absolute inset-x-0 bottom-10 text-body text-muted">
                The exhibition couldn’t load. Refresh to try again.
              </p>
            ) : (
              <div className="absolute inset-0 animate-pulse bg-raised/40" />
            )}
            {heroOverlay}
          </div>
        )}
      </main>
      <AnimatePresence>{gateOpen && <AccessModal onClose={() => setGateOpen(false)} />}</AnimatePresence>
    </div>
  )
}
