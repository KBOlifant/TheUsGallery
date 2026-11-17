// TheUsGallery motion: 600ms, cubic-bezier(.2,.7,.2,1). Slow reveals, image scale 1.04 on hover.
export const ease = [0.2, 0.7, 0.2, 1]
export const duration = 0.6

export const transition = { duration, ease }

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition },
}

/** Masked line reveal for display headlines: wrap each line in overflow-hidden. */
export const lineUp = {
  hidden: { y: '105%' },
  show: { y: '0%', transition: { duration: 0.9, ease } },
}

export const stagger = (step = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren } },
})

export const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } }
