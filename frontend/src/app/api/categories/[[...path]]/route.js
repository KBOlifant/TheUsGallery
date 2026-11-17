import { resource, route } from '@/server/http'
import { getCategories, getCategory } from '@/server/controllers/categories'

// All /api/categories/* endpoints.
const handle = resource([
  ['GET', '/', route(getCategories)],
  // Gallery contents: approved members only. The list (home carousel) stays public.
  ['GET', '/:id', route(getCategory, { access: 'approved' })],
])

export { handle as GET }
