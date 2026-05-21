import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { discoverItems } from '../data/discoverItems'
import PageCTA from '../components/PageCTA'

export default function Discover() {
  return (
    <PageShell
      eyebrow="City Discovery"
      title="Discover LA"
      subtitle="Local discovery, neighborhoods, restaurants, nightlife, shopping districts, hidden gems, and curated city routes."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <PageCTA />
        {discoverItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </div>
    </PageShell>
  )
}