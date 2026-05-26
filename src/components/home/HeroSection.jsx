import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { trackEvent } from '../../lib/analytics'

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center"
    >
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 backdrop-blur-md sm:mb-8 sm:px-5">
        <Sparkles className="h-4 w-4 shrink-0 text-cyan-300" />

        <span className="text-xs tracking-wide text-cyan-100 sm:text-sm">
          LA 2028 Tourism Access Platform
        </span>
      </div>

      <h1 className="mx-auto mb-6 max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        Navigate Los Angeles
        <br />
        <span className="text-cyan-300">
          Like Never Before
        </span>
      </h1>

      <p className="mx-auto mb-10 max-w-3xl text-base leading-8 text-white/65 sm:text-lg md:text-xl lg:text-2xl lg:leading-9">
        ForgePass LA combines live city intelligence,
        tourism discovery, transportation awareness,
        rewards, event access, and local experiences
        into one unified platform built for the 2028
        Olympic expansion.
      </p>

      <div className="mb-14 flex flex-col justify-center gap-4 sm:mb-20 sm:flex-row sm:gap-5">
        <a
          href="#waitlist"
          onClick={() => trackEvent('hero_cta_join_clicked')}
          className="rounded-2xl bg-cyan-300 px-6 py-4 text-base font-bold text-black shadow-[0_0_40px_rgba(0,255,255,0.25)] transition hover:scale-105 sm:px-8 sm:text-lg"
        >
          Join Early Access
        </a>

        <a
          href="#features"
          onClick={() => trackEvent('hero_cta_explore_clicked')}
          className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold backdrop-blur-md transition hover:bg-white/10 sm:px-8 sm:text-lg"
        >
          Explore Features
        </a>
      </div>
    </motion.div>
  )
}