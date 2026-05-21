import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { rewardItems } from '../data/rewardItems'
import PageCTA from '../components/PageCTA'
import CardGrid from '../components/CardGrid'
import PageFilters from '../components/PageFilters'

export default function Rewards() {
  return (
    <PageShell
      eyebrow="Progression System"
      title="Rewards"
      subtitle="XP, badges, city exploration rewards, early-access perks, merchant offers, and achievement systems."
    >
     <PageFilters
  label="Categories"
  options={['All', 'Progression', 'Achievements', 'Offers']}
/>
      <CardGrid>
       <PageCTA />
        {rewardItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </CardGrid>
    </PageShell>
  )
}