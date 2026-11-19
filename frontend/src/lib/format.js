const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const steps = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

/** "Just now", "5 minutes ago", "2 days ago" … */
export function timeAgo(iso, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  if (Math.abs(seconds) < 60) return 'Just now'
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) {
      const text = rtf.format(Math.round(seconds / size), unit)
      return text[0].toUpperCase() + text.slice(1)
    }
  }
  return 'Just now'
}

export const pad2 = (n) => String(n).padStart(2, '0')

/**
 * When a photo was taken, as a Date whose UTC fields hold the camera's wall-clock
 * time. Always format it with timeZone 'UTC' so the server render and every
 * visitor's browser show the same day and time.
 */
function takenDate(meta = {}) {
  if (meta.takenLocal) {
    const [date, time = '00:00:00'] = meta.takenLocal.split('T')
    const [y, mo, d] = date.split('-').map(Number)
    const [h, mi, s] = time.split(':').map(Number)
    const out = new Date(Date.UTC(y, mo - 1, d, h, mi, s || 0))
    if (!Number.isNaN(out.getTime())) return out
  }
  // Older uploads only stored the instant; close enough as a fallback.
  const out = meta.takenAt ? new Date(meta.takenAt) : null
  return out && !Number.isNaN(out.getTime()) ? out : null
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })

/** "4 July 2019" from the photo's metadata; falls back to the year, then "Undated". */
export function formatTakenDate(work) {
  const d = takenDate(work?.meta)
  if (d) return dateFmt.format(d)
  return work?.year ? String(work.year) : 'Undated'
}

/** "12:30" from the photo's metadata, or null when there's no date. */
export function formatTakenTime(work) {
  const d = takenDate(work?.meta)
  return d ? timeFmt.format(d) : null
}
