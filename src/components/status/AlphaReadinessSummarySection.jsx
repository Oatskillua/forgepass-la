import HomeSectionHeader from '../home/HomeSectionHeader'
import HomeGrid from '../home/HomeGrid'
import HomeCard from '../home/HomeCard'

import { alphaReadinessSummary } from '../../data/alphaReadinessSummary'

export default function AlphaReadinessSummarySection() {
  return (
    <section className="mt-20">
      <HomeSectionHeader
        eyebrow="Readiness Summary"
        title="Closed Alpha Position"
        subtitle="ForgePass LA is structurally ready for controlled tester onboarding, with remaining work focused on monitoring, abuse protection, and operational process refinement."
        align="left"
      />

      <HomeGrid columns="four">
        {alphaReadinessSummary.map((item) => (
          <HomeCard key={item.label} className="h-full">
            <p className="text-sm uppercase tracking-[0.2em] text-white/35">
              {item.label}
            </p>

            <h3 className="mt-3 text-3xl font-black text-cyan-300">
              {item.value}
            </h3>

            <p className="mt-4 leading-7 text-white/55">
              {item.detail}
            </p>
          </HomeCard>
        ))}
      </HomeGrid>
    </section>
  )
}