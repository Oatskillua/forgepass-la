import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { homeSystems } from '../../data/homeSystems'
import HomeSectionHeader from './HomeSectionHeader'

export default function SystemPreviewSection() {
  return (
    <section className="mb-20 lg:mb-32">
      <HomeSectionHeader
        eyebrow="Platform Systems"
        title="One Platform. Five Core Layers."
        subtitle="ForgePass LA is being structured as a modular city-access system for discovery, events, rewards, safety, and operational visibility."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {homeSystems.map((system) => {
          const Icon = system.icon

          return (
            <Link
              key={system.to}
              to={system.to}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
            >
              <Icon className="mb-5 h-8 w-8 text-cyan-300" />

              <h3 className="text-2xl font-bold">
                {system.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                {system.text}
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-cyan-300">
                Explore
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}