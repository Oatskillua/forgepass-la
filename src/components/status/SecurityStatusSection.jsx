import PageModule from '../PageModule'
import HomeSectionHeader from '../home/HomeSectionHeader'
import HomeGrid from '../home/HomeGrid'
import HomeCard from '../home/HomeCard'
import Badge from '../Badge'

import { securityStatus } from '../../data/securityStatus'

export default function SecurityStatusSection() {
  return (
    <section className="mt-16">
      <HomeSectionHeader
        eyebrow="Trust + Security"
        title="Production Safeguards"
        subtitle="ForgePass LA is being built with structured deployment, controlled backend access, analytics visibility, and production hardening practices from the earliest MVP stages."
        align="left"
      />

      <PageModule>
        <HomeGrid columns="three">
          {securityStatus.map((item) => (
            <HomeCard key={item.title} className="h-full">
              <Badge tone="cyan" className="mb-5">
                {item.status}
              </Badge>

              <h3 className="text-2xl font-bold">
                {item.title}
              </h3>

              <p className="mt-4 leading-7 text-white/55">
                {item.detail}
              </p>
            </HomeCard>
          ))}
        </HomeGrid>
      </PageModule>
    </section>
  )
}