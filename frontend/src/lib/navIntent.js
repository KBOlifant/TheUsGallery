/*
 * Next's router has no per-navigation state (react-router's `location.state`),
 * so the gallery leaves the artwork modal a note before navigating to a work:
 *   fromGallery — closing can go history-back instead of replacing the URL
 *   focusNotes  — open with the notes input focused
 * Client-side navigation keeps this module alive; a fresh page load (direct
 * link) starts with no intent, which is exactly the "not from the gallery" case.
 */
let intent = null

export function setNavIntent(workId, { focusNotes = false } = {}) {
  intent = { workId, fromGallery: true, focusNotes }
}

/** The intent left for this work, if any (pure read — safe in render). */
export function readNavIntent(workId) {
  return intent?.workId === workId ? intent : null
}

export function clearNavIntent() {
  intent = null
}
