'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getCategory } from '../functions/api'
import { fadeUp, lineUp, stagger } from '../lib/motion'
import { useLocomotive } from '../lib/scroll'
import { useAsync } from '../lib/useAsync'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { QuoteBand } from '../components/layout/QuoteBand'
import { CollectionSection } from '../components/gallery/CollectionSection'
import { Eyebrow } from '../components/ui/Bits'
import { TextLink } from '../components/ui/Button'

const nav = [
  { label: 'Change category', to: '/' },
  { label: 'Collection', href: '#collections' },
  { label: 'About', href: '#about' },
]

export function GalleryPage() {
  const { categoryId } = useParams()
  const { data: category, error, loading } = useAsync(() => getCategory(categoryId), [categoryId])

  // Start Locomotive once the collections are in the DOM so it finds every [data-scroll].
  useLocomotive(Boolean(category) && !loading, categoryId)

  return (
    <div id="top">
      <Header nav={nav} />

      <main>
        {error ? (
          <div className="px-page flex flex-col items-start gap-6 py-32">
            <Eyebrow>{error.status === 404 ? 'Not found' : 'Something went wrong'}</Eyebrow>
            <h1 className="font-display text-display-l">This room is closed.</h1>
            <TextLink to="/">Choose another category</TextLink>
          </div>
        ) : !category || loading ? (
          <div className="px-page py-32" aria-busy="true">
            <Eyebrow>Loading collection…</Eyebrow>
          </div>
        ) : (
          <>
            <motion.section
              initial="hidden"
              animate="show"
              variants={stagger(0.12, 0.05)}
              className="px-page grid gap-8 pt-16 pb-8 md:pt-24 lg:grid-cols-12 lg:gap-6"
            >
              <motion.div variants={fadeUp} className="lg:col-span-3">
                <Eyebrow>{category.name} · On view now</Eyebrow>
              </motion.div>
              <div className="lg:col-span-6" data-scroll data-scroll-speed="0.1">
                <h1 className="font-display text-display-xl">
                  {[category.name, 'collections'].map((line) => (
                    <span key={line} className="block overflow-hidden pb-[0.06em]">
                      <motion.span variants={lineUp} className="block">
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </h1>
              </div>
              <motion.p variants={fadeUp} className="max-w-xs self-end text-caption text-muted lg:col-span-3 lg:pb-4">
                {category.intro}
              </motion.p>
            </motion.section>

            <div id="collections">
              {category.collections.map((c) => (
                <CollectionSection key={c.id} collection={c} />
              ))}
            </div>

            <div className="pt-section">
              <QuoteBand />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="px-page flex flex-1 flex-col items-start justify-center gap-6">
        <Eyebrow>404</Eyebrow>
        <h1 className="font-display text-display-l">Nothing hangs here.</h1>
        <Link href="/" className="label border-b border-line pb-1.5 hover:border-text">
          Back to the exhibition
        </Link>
      </main>
    </div>
  )
}
