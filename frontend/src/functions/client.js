/*
 * Thin fetch wrapper for the real backend. Used by api.js when NEXT_PUBLIC_USE_MOCK=false.
 * Base URL comes from NEXT_PUBLIC_API_URL (default: same-origin /api — the Next.js route handlers).
 */

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '/api').replace(/\/$/, '')

/*
 * The auth layer injects a token getter at runtime (see AuthProvider), so this
 * module stays free of any Firebase import — the mock and test paths never load it.
 */
let getAuthToken = null
export function setAuthTokenProvider(fn) {
  getAuthToken = fn
}

export async function request(path, { method = 'GET', body, signal, isFormData = false } = {}) {
  const token = getAuthToken ? await getAuthToken() : null

  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: 'include',
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      message = (await res.json()).message ?? message
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status)
  }

  return res.status === 204 ? null : res.json()
}
