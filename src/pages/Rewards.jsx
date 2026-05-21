import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { rewardItems } from '../data/rewardItems'

export default function Rewards() {
  return (
    <PageShell
      eyebrow="Progression System"
      title="Rewards"
      subtitle="XP, badges, city exploration rewards, early-access perks, merchant offers, and achievement systems."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {rewardItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </div>
    </PageShell>
  )
}