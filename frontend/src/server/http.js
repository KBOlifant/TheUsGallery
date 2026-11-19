/**
 * Route-handler plumbing — the Next.js replacement for the old Express
 * middleware chain (authenticate → guard → multer → controller → errorHandler).
 *
 *   export const GET = route(getCategory)
 *   export const POST = route(createArtwork, { access: 'approved', file: 'image' })
 *
 * Controllers receive { user, params, query, body, file, request } and return
 * plain data (sent as JSON) or a Response (e.g. created(...) for a 201).
 * Errors become `{ message }` with the right status, which is what the
 * frontend's client.js expects.
 */
import { connectDB } from './db.js'
import { adminAuth } from './firebase.js'
import { env } from './env.js'
import { User } from './models/User.js'

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** 201 Created with a JSON body. */
export const created = (data) => Response.json(data, { status: 201 })

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * Optional auth. A valid "Authorization: Bearer <idToken>" upserts the User
 * (new users start `pending`, ADMIN_EMAILS start as approved admins) and
 * returns it. No token → null (public browsing). Bad/expired token → 401.
 */
async function authenticate(request) {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null
  if (!token) return null

  let decoded
  try {
    decoded = await adminAuth().verifyIdToken(token)
  } catch {
    throw new ApiError('Invalid or expired authentication token', 401)
  }

  const email = (decoded.email || '').toLowerCase()
  const isBootstrapAdmin = Boolean(email) && env.adminEmails.includes(email)

  const user = await User.findOneAndUpdate(
    { firebaseUid: decoded.uid },
    {
      $set: {
        email: decoded.email || '',
        displayName: decoded.name || '',
        photoURL: decoded.picture || '',
      },
      $setOnInsert: {
        role: isBootstrapAdmin ? 'admin' : 'user',
        status: isBootstrapAdmin ? 'approved' : 'pending',
        approvedAt: isBootstrapAdmin ? new Date() : null,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  // Promote a pre-existing account if its email is now in the admin list.
  if (isBootstrapAdmin && user.role !== 'admin') {
    user.role = 'admin'
    user.status = 'approved'
    user.approvedAt = user.approvedAt || new Date()
    await user.save()
  }

  return user
}

function requireUser(user) {
  if (!user) throw new ApiError('Authentication required', 401)
}

const guards = {
  public: () => {},
  auth: requireUser,
  approved: (user) => {
    requireUser(user)
    if (user.status !== 'approved') throw new ApiError('Your account is pending approval', 403)
  },
  admin: (user) => {
    requireUser(user)
    if (user.role !== 'admin') throw new ApiError('Admin access required', 403)
  },
}

/**
 * JSON or multipart body → { body, file }. For multipart, string fields land in
 * `body` and the single image field named `fileField` becomes
 * `file = { buffer, mimetype, size }` (same shape multer gave us).
 */
async function readBody(request, fileField) {
  const type = request.headers.get('content-type') || ''

  if (type.startsWith('multipart/form-data')) {
    const form = await request.formData()
    const body = {}
    let upload = null
    for (const [key, value] of form) {
      if (typeof value === 'string') body[key] = value
      else if (key === fileField && value.size > 0) upload = value
    }
    if (!upload) return { body, file: null }
    if (!upload.type.startsWith('image/')) throw new ApiError('Only image files are allowed', 400)
    if (upload.size > MAX_IMAGE_BYTES) throw new ApiError('Image is too large (max 10 MB)', 400)
    const buffer = Buffer.from(await upload.arrayBuffer())
    return { body, file: { buffer, mimetype: upload.type, size: upload.size, filename: upload.name } }
  }

  if (type.includes('application/json')) {
    try {
      return { body: (await request.json()) ?? {}, file: null }
    } catch {
      throw new ApiError('Request body is not valid JSON', 400)
    }
  }

  return { body: {}, file: null }
}

function errorResponse(err) {
  const json = (message, status) => Response.json({ message }, { status })

  // Mongoose validation / duplicate key / malformed ObjectId → readable 4xx.
  if (err.name === 'ValidationError') {
    return json(Object.values(err.errors).map((e) => e.message).join('; '), 400)
  }
  if (err.code === 11000) return json('That item already exists.', 409)
  if (err.name === 'CastError') return json('Invalid id', 400)

  const status = err.status || 500
  if (status >= 500) console.error('[api]', err)
  return json(err.message || 'Internal server error', status)
}

/**
 * Wrap a controller as a Next.js route handler.
 * @param access 'public' | 'auth' | 'approved' | 'admin'
 * @param file   multipart field name to accept a single image from
 */
export function route(controller, { access = 'public', file } = {}) {
  return async function handler(request, context) {
    try {
      await connectDB()
      const user = await authenticate(request)
      guards[access](user)

      const params = (await context?.params) ?? {}
      const query = Object.fromEntries(new URL(request.url).searchParams)
      const { body, file: upload } = await readBody(request, file)

      const result = await controller({ request, user, params, query, body, file: upload })
      return result instanceof Response ? result : Response.json(result)
    } catch (err) {
      return errorResponse(err)
    }
  }
}

/**
 * Group several endpoints in ONE route file (mount it at `[[...path]]/route.js`).
 * Each entry is [method, pattern, handler] where handler is a route(...) and
 * pattern is relative to the folder, with :params — e.g. '/:id/notes'.
 *
 *   const handle = resource([['GET', '/:id', route(getArtwork)], ...])
 *   export const GET = handle, POST = handle ...
 */
export function resource(entries) {
  const compiled = entries.map(([method, pattern, handler]) => ({
    method,
    handler,
    segments: pattern.split('/').filter(Boolean),
  }))

  return async function dispatch(request, context) {
    const path = ((await context?.params)?.path ?? []).map(decodeURIComponent)
    let pathMatched = false

    for (const { method, handler, segments } of compiled) {
      if (segments.length !== path.length) continue
      const params = {}
      const ok = segments.every((seg, i) => {
        if (seg.startsWith(':')) {
          params[seg.slice(1)] = path[i]
          return true
        }
        return seg === path[i]
      })
      if (!ok) continue
      pathMatched = true
      if (method === request.method) return handler(request, { params })
    }

    const { pathname } = new URL(request.url)
    return pathMatched
      ? Response.json({ message: `Method ${request.method} not allowed on ${pathname}` }, { status: 405 })
      : Response.json({ message: `Not found: ${request.method} ${pathname}` }, { status: 404 })
  }
}
