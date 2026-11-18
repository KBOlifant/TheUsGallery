// TEMPORARY diagnostics: GET /api/health?debug=1 reports what the deployed server can see.
// Never prints secret values — only presence flags and error messages. Remove once deployed fine.
export const dynamic = 'force-dynamic'

async function step(fn) {
  try {
    return { ok: true, ...(await fn()) }
  } catch (err) {
    return { ok: false, error: `${err?.name}: ${String(err?.message).slice(0, 300)}` }
  }
}

export async function GET(request) {
  const base = { status: 'ok', time: new Date().toISOString() }
  if (!new URL(request.url).searchParams.has('debug')) return Response.json(base)

  const has = (k) => Boolean(process.env[k])
  const env = Object.fromEntries(
    ['MONGODB_URI', 'FIREBASE_SERVICE_ACCOUNT', 'ADMIN_EMAILS', 'CLOUDINARY_URL', 'EMAILJS_PRIVATE_KEY'].map((k) => [k, has(k)]),
  )

  const firebaseJson = await step(async () => {
    const j = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '')
    return { project_id: j.project_id, hasPrivateKey: Boolean(j.private_key) }
  })

  const mongo = await step(async () => {
    const { connectDB } = await import('@/server/db')
    const c = await connectDB()
    return { db: c.name }
  })

  const firebaseAdmin = await step(async () => {
    const { adminAuth } = await import('@/server/firebase')
    adminAuth()
    return {}
  })

  return Response.json({ ...base, node: process.version, env, firebaseJson, mongo, firebaseAdmin })
}
