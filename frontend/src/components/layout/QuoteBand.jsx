import { motion } from 'framer-motion'
import { fadeUp, inView, stagger } from '../../lib/motion'
import { scrollToTarget } from '../../lib/scroll'
import { Eyebrow } from '../ui/Bits'
import { TextLink } from '../ui/Button'

/** Closing quote band: the one accent word in the quote. */
export function QuoteBand({ id = 'about' }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-quote`}
      className="px-page relative py-32 text-center md:py-44"
      style={{ background: 'radial-gradient(ellipse at center, var(--glow) 0%, var(--ground) 70%)' }}
    >
      <motion.div variants={stagger(0.12)} {...inView} className="mx-auto flex max-w-4xl flex-col items-center gap-8">
        <motion.div variants={fadeUp}>
          <Eyebrow>The Gallery of Us</Eyebrow>
        </motion.div>
        <motion.blockquote id={`${id}-quote`} variants={fadeUp} className="font-display text-display-l">
          “Lets make memories. <span className="text-accent">Together.</span>”
        </motion.blockquote>
        <motion.div variants={fadeUp}>
          <TextLink
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget(0)
            }}
          >
            Return to the collection
          </TextLink>
        </motion.div>
      </motion.div>
    </section>
  )
}
