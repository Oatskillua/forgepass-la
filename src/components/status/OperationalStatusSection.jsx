import HomeSectionHeader from '../home/HomeSectionHeader'
import HomeGrid from '../home/HomeGrid'
import HomeCard from '../home/HomeCard'
import Badge from '../Badge'

import { platformStatus } from '../../data/platformStatus'

export default function OperationalStatusSection() {
  return (
    <section className="mt-20">
      <HomeSectionHeader
        eyebrow="Operational Transparency"
        title="Platform System Status"
        subtitle="ForgePass LA publicly tracks infrastructure readiness, deployment progress, backend hardening, and platform operational maturity."
        align="left"
      />

      <HomeGrid columns="three">
        {platformStatus.map((item) => (
          <HomeCard key={item.system} className="h-full">
            <Badge tone="cyan" className="mb-5">
              {item.status}
            </Badge>

            <h3 className="text-2xl font-bold">
              {item.system}
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