import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { discoverItems } from '../data/discoverItems'
import PageCTA from '../components/PageCTA'
import CardGrid from '../components/CardGrid'

export default function Discover() {
  return (
    <PageShell
      eyebrow="City Discovery"
      title="Discover LA"
      subtitle="Local discovery, neighborhoods, restaurants, nightlife, shopping districts, hidden gems, and curated city routes."
    >
      <CardGrid>
        <PageCTA />
        {discoverItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </CardGrid>
    </PageShell>
  )
}