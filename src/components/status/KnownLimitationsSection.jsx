import HomeSectionHeader from '../home/HomeSectionHeader'
import HomeGrid from '../home/HomeGrid'
import HomeCard from '../home/HomeCard'
import Badge from '../Badge'

import { knownLimitations } from '../../data/knownLimitations'

export default function KnownLimitationsSection() {
  return (
    <section className="mt-20">
      <HomeSectionHeader
        eyebrow="Alpha Disclosure"
        title="Known MVP Limitations"
        subtitle="ForgePass LA is currently in controlled alpha preparation. These limitations define what is not yet active before broader public onboarding."
        align="left"
      />

      <HomeGrid columns="two">
        {knownLimitations.map((item) => (
          <HomeCard key={item.title} className="h-full">
            <Badge tone="yellow" className="mb-5">
              Not Yet Active
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
    </section>
  )
}