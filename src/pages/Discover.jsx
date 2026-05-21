import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { discoverItems } from '../data/discoverItems'
import PageCTA from '../components/PageCTA'
import CardGrid from '../components/CardGrid'
import PageFilters from '../components/PageFilters'

export default function Discover() {
  return (
    <PageShell
      eyebrow="City Discovery"
      title="Discover LA"
      subtitle="Local discovery, neighborhoods, restaurants, nightlife, shopping districts, hidden gems, and curated city routes."
    >
    <PageFilters
  label="Categories"
  options={['All', 'Neighborhood', 'Coastal Route', 'Entertainment']}
/>
      <CardGrid>
        <PageCTA />
        {discoverItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </CardGrid>
    </PageShell>
  )
}