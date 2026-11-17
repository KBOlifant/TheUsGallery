'use client'

import { AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { ArtworkModal } from '../../../components/artwork/ArtworkModal'

/** Lives in the gallery layout (not the work page) so the modal can animate out on close. */
export function WorkModal() {
  const { categoryId, workId } = useParams()
  return (
    <AnimatePresence>
      {workId && <ArtworkModal key={workId} categoryId={categoryId} workId={workId} />}
    </AnimatePresence>
  )
}
