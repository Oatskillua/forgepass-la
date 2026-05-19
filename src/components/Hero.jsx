import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
        <Zap className="w-4 h-4" />
        <span className="text-sm">
          LA 2028 Tourism Access Platform
        </span>
      </div>

      <h1 className="text-6xl font-black mb-6 leading-tight">
        ForgePass LA
      </h1>

      <p className="text-xl text-white/70 max-w-3xl mx-auto mb-12">
        Discover events, local experiences, nightlife,
        transportation, rewards, and exclusive city access
        during the 2028 Los Angeles Olympic expansion.
      </p>
    </motion.div>
  )
}