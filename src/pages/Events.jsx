import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { eventItems } from '../data/eventItems'

export default function Events() {
  return (
    <PageShell
      eyebrow="Live Experiences"
      title="Events"
      subtitle="Olympic-adjacent experiences, fan zones, concerts, nightlife, pop-ups, and curated activity listings."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {eventItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </div>
    </PageShell>
  )
}