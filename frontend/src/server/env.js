/**
 * Server-side environment config. Import `env` instead of reading process.env
 * directly. Next.js loads .env.local automatically; the seed script uses
 * `node --env-file=.env.local`.
 */
function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const env = {
  // Lazy so `next build` doesn't need the secret just to compile routes.
  get mongoUri() {
    return required('MONGODB_URI')
  },

  firebase: {
    // Either the service-account JSON itself (handy on hosts without a filesystem)…
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT,
    // …or a path to the downloaded key file, relative to the project root.
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json',
  },

  // Emails auto-promoted to admin (+approved) on first login.
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),

  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
  },
}
