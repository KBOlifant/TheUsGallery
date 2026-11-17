/** Mirrors the frontend's slugify so ids stay stable between mock and real API. */
export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Zero-pad a 1-based position to a 2-digit string, e.g. 1 -> "01". */
export const pad = (n) => String(n).padStart(2, '0')
