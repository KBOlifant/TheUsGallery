'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Two independent settings: the mode (light/dark) and the colour palette.
// Any palette works in either mode.
export const MODES = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
]

export const PALETTES = [
  { id: 'lime', label: 'Lime', dot: '#D6F04F' },
  { id: 'purple', label: 'Purple', dot: '#A678F2' },
  { id: 'orange', label: 'Orange', dot: '#FF8A2B' },
]

const MODE_KEY = 'aperture:theme'
const PALETTE_KEY = 'aperture:palette'
const ThemeContext = createContext(null)

const validMode = (v) => (MODES.some((m) => m.id === v) ? v : null)
const validPalette = (v) => (PALETTES.some((p) => p.id === v) ? v : null)

export function ThemeProvider({ children }) {
  // null until mounted: the server can't know the saved choice, so the first
  // client render must match the server's defaults. The inline script in the root
  // layout has already applied the saved values to <html> before paint.
  const [savedMode, setMode] = useState(null)
  const [savedPalette, setPalette] = useState(null)
  const mode = savedMode ?? 'dark'
  const palette = savedPalette ?? 'lime'

  useEffect(() => {
    const el = document.documentElement
    setMode(validMode(el.dataset.theme) ?? 'dark')
    setPalette(validPalette(el.dataset.palette) ?? 'lime')
  }, [])

  useEffect(() => {
    if (!savedMode) return
    document.documentElement.dataset.theme = savedMode
    try {
      localStorage.setItem(MODE_KEY, savedMode)
    } catch {
      /* storage blocked */
    }
  }, [savedMode])

  useEffect(() => {
    if (!savedPalette) return
    document.documentElement.dataset.palette = savedPalette
    try {
      localStorage.setItem(PALETTE_KEY, savedPalette)
    } catch {
      /* storage blocked */
    }
  }, [savedPalette])

  return <ThemeContext.Provider value={{ mode, setMode, palette, setPalette }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
