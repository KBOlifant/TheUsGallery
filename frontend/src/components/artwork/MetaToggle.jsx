import { useId, useState } from 'react'
import { formatTakenDate, formatTakenTime } from '../../lib/format'

const fmtSize = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)

// Display order + labels. Anything not listed here is left out.
const ROWS = [
  [(m) => (m.takenAt || m.takenLocal ? `${formatTakenDate({ meta: m })}, ${formatTakenTime({ meta: m })}` : null), 'Taken'],
  ['camera', 'Camera'],
  ['lens', 'Lens'],
  ['focalLength', 'Focal length'],
  ['aperture', 'Aperture'],
  ['exposure', 'Shutter'],
  ['iso', 'ISO'],
  [(m) => (m.width && m.height ? `${m.width} × ${m.height}` : null), 'Dimensions'],
  [(m) => (m.latitude != null && m.longitude != null ? `${m.latitude.toFixed(4)}, ${m.longitude.toFixed(4)}` : null), 'Location'],
  ['software', 'Software'],
  ['photographer', 'Photographer'],
  ['fileName', 'File'],
  ['fileType', 'Type'],
  ['fileSize', 'Size', fmtSize],
]

function rowsFor(meta = {}) {
  return ROWS.map(([key, label, format]) => {
    const raw = typeof key === 'function' ? key(meta) : meta[key]
    return raw == null || raw === '' ? null : [label, format ? format(raw) : String(raw)]
  }).filter(Boolean)
}

/**
 * "Show meta" button that reveals the image's name and the details stored from its
 * own metadata. Always shown, so works uploaded before metadata was stored still get it.
 */
export function MetaToggle({ meta, name, className = '' }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rows = [...(name ? [['Name', name]] : []), ...rowsFor(meta)]

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="text-[10px] uppercase tracking-[0.18em] text-muted underline-offset-4 transition-colors duration-300 hover:text-text hover:underline"
      >
        {open ? 'Hide meta' : 'Show meta'}
      </button>
      {open && rows.length === 0 && (
        <p id={panelId} className="mt-3 text-[11px] text-muted">No metadata was found for this image.</p>
      )}
      {open && rows.length > 0 && (
        <dl id={panelId} className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[11px]">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="uppercase tracking-[0.15em] text-muted">{label}</dt>
              <dd className="min-w-0 break-words text-text">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
