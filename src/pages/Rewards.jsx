import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { rewardItems } from '../data/rewardItems'
import PageCTA from '../components/PageCTA'
import CardGrid from '../components/CardGrid'

export default function Rewards() {
  return (
    <PageShell
      eyebrow="Progression System"
      title="Rewards"
      subtitle="XP, badges, city exploration rewards, early-access perks, merchant offers, and achievement systems."
    >
      <CardGrid>
       <PageCTA />
        {rewardItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </CardGrid>
    </PageShell>
  )
}