import HomeSectionHeader from '../home/HomeSectionHeader'
import HomeGrid from '../home/HomeGrid'
import HomeCard from '../home/HomeCard'
import Badge from '../Badge'

import { releaseChecklist } from '../../data/releaseChecklist'

export default function ReleaseChecklistSection() {
  return (
    <section className="mt-20">
      <HomeSectionHeader
        eyebrow="Release Readiness"
        title="Platform Readiness Checklist"
        subtitle="ForgePass LA publicly tracks infrastructure maturity, operational readiness, legal preparation, and security hardening progress toward controlled public onboarding."
        align="left"
      />

      <HomeGrid columns="two">
        {releaseChecklist.map((section) => (
          <HomeCard key={section.category} className="h-full">
            <Badge tone="cyan" className="mb-5">
              {section.status}
            </Badge>

            <h3 className="text-2xl font-bold">
              {section.category}
            </h3>

            <ul className="mt-6 space-y-3 text-white/60">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3"
                >
                  <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />

                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </HomeCard>
        ))}
      </HomeGrid>
    </section>
  )
}