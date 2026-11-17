/** Firebase Admin SDK — verifies the ID tokens the browser sends. */
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { env } from './env.js'

function loadServiceAccount() {
  if (env.firebase.serviceAccountJson) return JSON.parse(env.firebase.serviceAccountJson)
  // turbopackIgnore: a runtime path; don't trace the whole project into the server bundle.
  const path = resolve(/* turbopackIgnore: true */ process.cwd(), env.firebase.serviceAccountPath)
  return JSON.parse(readFileSync(path, 'utf8'))
}

function app() {
  if (getApps().length) return getApps()[0]
  const serviceAccount = loadServiceAccount()
  console.log(`[firebase] admin initialized for project ${serviceAccount.project_id}`)
  return initializeApp({ credential: cert(serviceAccount) })
}

/** The Admin Auth client (initializes the app on first use). */
export const adminAuth = () => getAuth(app())
