/**
 * Reads the metadata embedded in an image file (EXIF / TIFF / GPS) and turns it
 * into a small, JSON-safe object. Only what the file itself says is used — no
 * guessing from upload time or filenames.
 */
import exifr from 'exifr'

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const date = (v) => (v instanceof Date && !Number.isNaN(v.getTime()) ? v : undefined)

/** 1/250s for fast shutters, "2s" for slow ones. */
function formatExposure(t) {
  if (!num(t) || t <= 0) return undefined
  return t >= 1 ? `${Number(t.toFixed(1))}s` : `1/${Math.round(1 / t)}s`
}

const p2 = (n) => String(n).padStart(2, '0')

/**
 * EXIF dates carry no timezone, so exifr reads them as this server's local time.
 * Reading the local parts back gives the camera's wall-clock time exactly, as
 * "2019-07-04T12:30:00", so viewers in any timezone see what the camera recorded.
 */
const toWallClock = (d) =>
  `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`

/** Drop undefined values so the stored document stays tidy. */
const compact = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))

/**
 * @param {Buffer} buffer  raw image bytes
 * @param {{ filename?: string, mimetype?: string, size?: number }} file
 * @returns {Promise<{ takenAt?: Date, year?: number, meta: object }>}
 */
export async function extractImageMeta(buffer, file = {}) {
  let tags = {}
  try {
    tags = (await exifr.parse(buffer, { tiff: true, exif: true, gps: true, xmp: false, iptc: false })) || {}
  } catch {
    // Not every image carries (or survives) EXIF — that is fine.
  }

  const takenAt = date(tags.DateTimeOriginal) || date(tags.CreateDate) || date(tags.ModifyDate)

  const meta = compact({
    takenAt: takenAt?.toISOString(),
    takenLocal: takenAt && toWallClock(takenAt),
    camera: [str(tags.Make), str(tags.Model)].filter(Boolean).join(' ') || undefined,
    lens: str(tags.LensModel),
    focalLength: num(tags.FocalLength) ? `${Math.round(tags.FocalLength)}mm` : undefined,
    aperture: num(tags.FNumber) ? `f/${Number(tags.FNumber.toFixed(1))}` : undefined,
    exposure: formatExposure(tags.ExposureTime),
    iso: num(tags.ISO),
    width: num(tags.ExifImageWidth) || num(tags.ImageWidth),
    height: num(tags.ExifImageHeight) || num(tags.ImageHeight),
    latitude: num(tags.latitude),
    longitude: num(tags.longitude),
    software: str(tags.Software),
    photographer: str(tags.Artist),
    fileName: file.filename,
    fileType: file.mimetype,
    fileSize: file.size,
  })

  // EXIF dates have no timezone, so exifr reads them as local time; use local year to match.
  return { takenAt, year: takenAt?.getFullYear(), meta }
}
