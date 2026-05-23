import { liveMetrics } from '../../data/liveMetrics'
import { liveMetricsConfig } from '../../data/liveMetricsConfig'
import HomeSectionHeader from './HomeSectionHeader'
import HomeCard from './HomeCard'

export default function LiveMetricsSection() {
  return (
    <section className="mb-20 lg:mb-32">
      <HomeSectionHeader
        eyebrow={liveMetricsConfig.eyebrow}
        title={liveMetricsConfig.title}
        subtitle={liveMetricsConfig.description}
        align="left"
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {liveMetrics.map((metric) => (
          <HomeCard key={metric.label}>
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-cyan-300">
              {metric.status}
            </div>

            <p className="text-sm uppercase tracking-[0.2em] text-white/35">
              {metric.label}
            </p>

            <h3 className="mt-3 text-3xl font-black">
              {metric.value}
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/50">
              {metric.detail}
            </p>
          </HomeCard>
        ))}
      </div>
    </section>
  )
}