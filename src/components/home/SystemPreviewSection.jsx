import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { homeSystems } from '../../data/homeSystems'
import HomeSectionHeader from './HomeSectionHeader'
import HomeCard from './HomeCard'
import HomeGrid from './HomeGrid'

export default function SystemPreviewSection() {
  return (
    <section className="mb-20 lg:mb-32">
      <HomeSectionHeader
        eyebrow="Platform Systems"
        title="One Platform. Five Core Layers."
        subtitle="ForgePass LA is being structured as a modular city-access system for discovery, events, rewards, safety, and operational visibility."
      />

      <HomeGrid columns="five" className="gap-6">
        {homeSystems.map((system) => {
          const Icon = system.icon

          return (
            <Link key={system.to} to={system.to}>
              <HomeCard className="h-full">
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
              </HomeCard>
            </Link>
          )
        })}
      </HomeGrid>
    </section>
  )
}