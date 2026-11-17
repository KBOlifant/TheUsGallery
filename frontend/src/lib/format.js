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
