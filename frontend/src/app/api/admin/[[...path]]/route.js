import { resource, route } from '@/server/http'
import { listUsers, approveUser, rejectUser, setUserRole } from '@/server/controllers/users'
import { createCategory, updateCategory, deleteCategory, reorderCategories } from '@/server/controllers/adminCategories'
import {
  listCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections,
} from '@/server/controllers/adminCollections'

// Most /api/admin/* endpoints require a full admin. The two "create" routes below
// also accept a co-admin, so they can add their own category/collection while uploading.
const admin = { access: 'admin' }
const coAdmin = { access: 'coAdmin' }

const handle = resource([
  // Users
  ['GET', '/users', route(listUsers, admin)],
  ['PUT', '/users/:id/approve', route(approveUser, admin)],
  ['PUT', '/users/:id/reject', route(rejectUser, admin)],
  ['PUT', '/users/:id/role', route(setUserRole, admin)],

  // Categories (banner is an optional image field named "banner")
  ['POST', '/categories', route(createCategory, { ...coAdmin, file: 'banner' })],
  // Reorder routes must come before the ':slug' / ':id' ones so "order" isn't read as an id.
  ['PUT', '/categories/order', route(reorderCategories, admin)],
  ['PUT', '/categories/:slug', route(updateCategory, { ...admin, file: 'banner' })],
  ['DELETE', '/categories/:slug', route(deleteCategory, admin)],

  // Collections (collection ops use _id)
  ['GET', '/collections', route(listCollections, coAdmin)],
  ['POST', '/collections', route(createCollection, coAdmin)],
  ['PUT', '/collections/order', route(reorderCollections, admin)],
  ['PUT', '/collections/:id', route(updateCollection, admin)],
  ['DELETE', '/collections/:id', route(deleteCollection, admin)],
])

export { handle as GET, handle as POST, handle as PUT, handle as DELETE }
