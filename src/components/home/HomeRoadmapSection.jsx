import RoadmapModule from '../RoadmapModule'
import PageModule from '../PageModule'
import HomeSectionHeader from './HomeSectionHeader'

import { homeRoadmapItems } from '../../data/homeRoadmapItems'

export default function HomeRoadmapSection() {
  return (
    <section className="mb-20 lg:mb-32">
      <HomeSectionHeader
        eyebrow="Build Roadmap"
        title="From waitlist to city access platform."
        subtitle="ForgePass LA is being built in controlled phases so the product can scale from MVP infrastructure into a real-time tourism operating layer."
      />

      <PageModule>
        <RoadmapModule items={homeRoadmapItems} />
      </PageModule>
    </section>
  )
}