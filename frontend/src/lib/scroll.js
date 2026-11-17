/*
 * Smooth-scroll engines.
 *   Home page    → Lenis              (useLenis)
 *   Other pages  → Locomotive Scroll  (useLocomotive; v5 is built on Lenis)
 *
 * Only one engine is alive at a time. lockScroll()/unlockScroll() let the
 * artwork modal freeze whichever one is running.
 */
import { useEffect } from 'react'
import Lenis from 'lenis'
import LocomotiveScroll from 'locomotive-scroll'

const lenisOptions = {
  lerp: 0.08,
  // Let nested scrollers (artwork rows, modal panel) scroll natively.
  allowNestedScroll: true,
}

let active = null // { stop, start, scrollTo }

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function lockScroll() {
  active?.stop()
  document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll() {
  document.documentElement.style.overflow = ''
  active?.start()
}

/** Scroll to a selector, element or offset with whichever engine is active (native fallback). */
export function scrollToTarget(target, options) {
  if (active) return active.scrollTo(target, options)
  if (typeof target === 'number') return window.scrollTo({ top: target })
  const el = typeof target === 'string' ? document.querySelector(target) : target
  el?.scrollIntoView()
}

export function useLenis() {
  useEffect(() => {
    window.scrollTo(0, 0)
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ ...lenisOptions, autoRaf: true })
    const handle = {
      stop: () => lenis.stop(),
      start: () => lenis.start(),
      scrollTo: (t, o) => lenis.scrollTo(t, o),
    }
    active = handle
    return () => {
      if (active === handle) active = null
      lenis.destroy()
    }
  }, [])
}

/**
 * Locomotive scans the DOM for [data-scroll] once, when it starts. Pass `ready`
 * as true only after the page's content has rendered; change `key` to rebuild
 * (e.g. when the category changes).
 */
export function useLocomotive(ready, key) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [key])

  useEffect(() => {
    if (!ready || prefersReducedMotion()) return

    const loco = new LocomotiveScroll({ lenisOptions })
    const handle = {
      stop: () => {
        loco.lenisInstance?.stop()
        loco.stop()
      },
      start: () => {
        loco.lenisInstance?.start()
        loco.start()
      },
      scrollTo: (t, o) => loco.scrollTo(t, o),
    }
    active = handle
    return () => {
      if (active === handle) active = null
      loco.destroy()
    }
  }, [ready, key])
}
