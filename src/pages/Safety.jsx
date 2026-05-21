import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import { safetyItems } from '../data/safetyItems'

export default function Safety() {
  return (
    <PageShell
      title="Safety"
      subtitle="Crowd awareness, alerts, safer navigation, transit visibility, and trusted experience signals."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {safetyItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </div>
    </PageShell>
  )
}