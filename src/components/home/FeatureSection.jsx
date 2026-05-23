import { motion } from 'framer-motion'
import { homeFeatures } from '../../data/homeFeatures'

export default function FeatureSection() {
  return (
    <div
      id="features"
      className="mb-20 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 lg:mb-28"
    >
      {homeFeatures.map((feature, index) => {
        const Icon = feature.icon

        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:border-cyan-300/30 sm:p-8"
          >
            <Icon className="mb-5 h-9 w-9 text-cyan-300 sm:mb-6 sm:h-10 sm:w-10" />

            <h3 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
              {feature.title}
            </h3>

            <p className="text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
              {feature.text}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}