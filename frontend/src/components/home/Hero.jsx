import { motion } from 'framer-motion'
import { fadeUp, lineUp, stagger } from '../../lib/motion'
import { Eyebrow } from '../ui/Bits'

const lines = ['Explore The', 'Us Gallery']

export function Hero() {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={stagger(0.12, 0.1)}
      className="px-page grid gap-8 pt-8 md:pt-12 lg:grid-cols-12 lg:gap-6"
    >
      <motion.div variants={fadeUp} className="lg:col-span-3">
        <Eyebrow>Our personal Digital Exhibition</Eyebrow>
      </motion.div>

      <h1 className="font-display text-[clamp(3.5rem,10vw,9.5rem)] leading-[0.92] tracking-[-0.01em] lg:col-span-6 lg:-ml-6">
        {lines.map((line) => (
          <span key={line} className="block overflow-hidden pb-[0.06em]">
            <motion.span variants={lineUp} className="block">
              {line}
            </motion.span>
          </span>
        ))}
      </h1>
    </motion.section>
  )
}
