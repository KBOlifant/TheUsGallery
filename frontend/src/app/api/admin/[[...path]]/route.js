import { resource, route } from '@/server/http'
import { listUsers, approveUser, rejectUser } from '@/server/controllers/users'
import { createCategory, updateCategory, deleteCategory, reorderCategories } from '@/server/controllers/adminCategories'
import {
  listCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections,
} from '@/server/controllers/adminCollections'

// All /api/admin/* endpoints — every one requires an admin user.
const admin = { access: 'admin' }

const handle = resource([
  // Users
  ['GET', '/users', route(listUsers, admin)],
  ['PUT', '/users/:id/approve', route(approveUser, admin)],
  ['PUT', '/users/:id/reject', route(rejectUser, admin)],

  // Categories (banner is an optional image field named "banner")
  ['POST', '/categories', route(createCategory, { ...admin, file: 'banner' })],
  // Reorder routes must come before the ':slug' / ':id' ones so "order" isn't read as an id.
  ['PUT', '/categories/order', route(reorderCategories, admin)],
  ['PUT', '/categories/:slug', route(updateCategory, { ...admin, file: 'banner' })],
  ['DELETE', '/categories/:slug', route(deleteCategory, admin)],

  // Collections (collection ops use _id)
  ['GET', '/collections', route(listCollections, admin)],
  ['POST', '/collections', route(createCollection, admin)],
  ['PUT', '/collections/order', route(reorderCollections, admin)],
  ['PUT', '/collections/:id', route(updateCollection, admin)],
  ['DELETE', '/collections/:id', route(deleteCollection, admin)],
])

export { handle as GET, handle as POST, handle as PUT, handle as DELETE }
