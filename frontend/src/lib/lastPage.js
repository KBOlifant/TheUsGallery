/*
 * Remembers the last page a visitor was on, so a fresh tab can resume there
 * instead of always landing back on the home carousel. The resume itself is
 * gated by a sessionStorage flag so it only fires once per tab — otherwise
 * clicking "home" mid-session would just bounce the visitor right back.
 */
const LAST_PATH_KEY = 'aperture:lastPath'
const RESUMED_KEY = 'aperture:resumed'

/** Called on every route change. "/" itself is never worth resuming to. */
export function rememberPath(pathname) {
  if (!pathname || pathname === '/') return
  try {
    localStorage.setItem(LAST_PATH_KEY, pathname)
    // This tab is already past the home page, so a later visit to "/" is deliberate.
    sessionStorage.setItem(RESUMED_KEY, '1')
  } catch {
    /* storage blocked */
  }
}

/** The page to resume to, or null if this tab already resumed once this session, or there's nothing saved. */
export function takeResumePath() {
  try {
    if (sessionStorage.getItem(RESUMED_KEY)) return null
    sessionStorage.setItem(RESUMED_KEY, '1')
    return localStorage.getItem(LAST_PATH_KEY) || null
  } catch {
    return null
  }
}
