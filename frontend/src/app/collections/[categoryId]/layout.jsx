import { GalleryPage } from '../../../views/GalleryPage'
import { WorkModal } from './WorkModal'
import { GalleryGate } from '../../../components/auth/GalleryGate'

/*
 *   /collections/:categoryId                  Gallery (Locomotive)
 *   /collections/:categoryId/works/:workId    Gallery + artwork modal on top
 *
 * The gallery lives in this layout, so it stays mounted (scroll position kept)
 * while the modal opens and closes over it, and direct links to a work work too.
 * Both pages render nothing; WorkModal reads the URL.
 */
export default function GalleryLayout({ children }) {
  return (
    <GalleryGate>
      <GalleryPage />
      {children}
      <WorkModal />
    </GalleryGate>
  )
}
