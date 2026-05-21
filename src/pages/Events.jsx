import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { eventItems } from '../data/eventItems'
import PageCTA from '../components/PageCTA'
import CardGrid from '../components/CardGrid'
import PageFilters from '../components/PageFilters'

export default function Events() {
  return (
    <PageShell
      eyebrow="Live Experiences"
      title="Events"
      subtitle="Olympic-adjacent experiences, fan zones, concerts, nightlife, pop-ups, and curated activity listings."
    >
     <PageFilters
  label="Categories"
  options={['All', 'Olympic Adjacent', 'After Hours', 'Experiences']}
/>
      <CardGrid>
       <PageCTA />
        {eventItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </CardGrid>
    </PageShell>
  )
}