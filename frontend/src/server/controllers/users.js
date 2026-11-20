import { User } from '../models/User.js'
import { ApiError } from '../http.js'
import { sendApprovalEmail } from '../email.js'

/** GET /me — the current user's profile + approval status. */
export function getMe({ user: u }) {
  return {
    id: String(u._id),
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    role: u.role,
    status: u.status,
  }
}

function toProfile(u) {
  return {
    id: String(u._id),
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    approvedAt: u.approvedAt,
  }
}

/** GET /admin/users?status=pending|approved|rejected */
export async function listUsers({ query }) {
  const filter = {}
  if (query.status) filter.status = query.status
  const users = await User.find(filter).sort({ createdAt: -1 }).lean()
  return users.map(toProfile)
}

/** PUT /admin/users/:id/approve — approve + email the user. */
export async function approveUser({ params, user: admin }) {
  const user = await User.findById(params.id)
  if (!user) throw new ApiError('User not found', 404)

  user.status = 'approved'
  user.approvedAt = new Date()
  user.approvedBy = admin._id
  await user.save()

  const email = user.email
    ? await sendApprovalEmail({ toEmail: user.email, toName: user.displayName })
    : { sent: false, skipped: true }
  return { user: toProfile(user), email }
}

/** PUT /admin/users/:id/reject */
export async function rejectUser({ params }) {
  const user = await User.findById(params.id)
  if (!user) throw new ApiError('User not found', 404)
  user.status = 'rejected'
  await user.save()
  return { user: toProfile(user) }
}

const ROLES = ['user', 'co-admin', 'admin']

/** PUT /admin/users/:id/role  { role: 'user' | 'co-admin' | 'admin' } */
export async function setUserRole({ params, body }) {
  if (!ROLES.includes(body?.role)) throw new ApiError(`role must be one of: ${ROLES.join(', ')}`, 400)

  const user = await User.findById(params.id)
  if (!user) throw new ApiError('User not found', 404)

  user.role = body.role
  await user.save()
  return { user: toProfile(user) }
}
