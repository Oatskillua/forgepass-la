import RoadmapModule from '../RoadmapModule'
import PageModule from '../PageModule'
import { useTrackOnce } from '../../hooks/useTrackOnce'
import { homeRoadmapItems } from '../../data/homeRoadmapItems'
import { analyticsEvents } from '../../config/analyticsEvents'
import HomeSection from './HomeSection'
import HomeSectionHeader from './HomeSectionHeader'

export default function HomeRoadmapSection() {
  useTrackOnce(analyticsEvents.HOME_ROADMAP_VIEWED)
  return (
    <HomeSection>
      <HomeSectionHeader
        eyebrow="Build Roadmap"
        title="From waitlist to city access platform."
        subtitle="ForgePass LA is being built in controlled phases so the product can scale from MVP infrastructure into a real-time tourism operating layer."
      />

      <PageModule>
        <RoadmapModule items={homeRoadmapItems} />
      </PageModule>
    </HomeSection>
  )
}