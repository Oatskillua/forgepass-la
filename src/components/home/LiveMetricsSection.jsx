import { liveMetrics } from '../../data/liveMetrics'
import { liveMetricsConfig } from '../../data/liveMetricsConfig'
import { useTrackOnce } from '../../hooks/useTrackOnce'
import HomeSection from './HomeSection'
import HomeSectionHeader from './HomeSectionHeader'
import HomeCard from './HomeCard'
import HomeGrid from './HomeGrid'

import Badge from '../Badge'

export default function LiveMetricsSection() {
 useTrackOnce('home_live_metrics_viewed')
  return (
    <HomeSection>
      <HomeSectionHeader
        eyebrow={liveMetricsConfig.eyebrow}
        title={liveMetricsConfig.title}
        subtitle={liveMetricsConfig.description}
        align="left"
      />

      <HomeGrid columns="four">
        {liveMetrics.map((metric) => (
          <HomeCard key={metric.label}>
            <Badge tone="cyan" className="mb-5">
              {metric.status}
            </Badge>

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
      </HomeGrid>
    </HomeSection>
  )
}