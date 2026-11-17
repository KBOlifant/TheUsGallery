import { route } from '@/server/http'
import { getMe } from '@/server/controllers/users'

export const GET = route(getMe, { access: 'auth' })
