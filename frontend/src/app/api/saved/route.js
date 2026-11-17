import { route } from '@/server/http'
import { getSaved } from '@/server/controllers/interactions'

export const GET = route(getSaved, { access: 'approved' })
