import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { safetyItems } from '../data/safetyItems'
import PageCTA from '../components/PageCTA'
import CardGrid from '../components/CardGrid'

export default function Safety() {
  return (
    <PageShell
      eyebrow="Awareness Network"
      title="Safety"
      subtitle="Crowd awareness, alerts, safer navigation, transit visibility, and trusted experience signals."
    >
      <CardGrid>
        <PageCTA />
        {safetyItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </CardGrid>
    </PageShell>
  )
}