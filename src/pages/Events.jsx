import PageShell from '../components/PageShell'

export default function Events() {
  return (
    <PageShell
      title="Events"
      subtitle="Olympic-adjacent experiences, fan zones, concerts, nightlife, pop-ups, and curated activity listings."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {['Fan Zones', 'Nightlife', 'Live Experiences'].map((item) => (
          <div
            key={item}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
          >
            <h2 className="text-2xl font-bold">{item}</h2>
            <p className="mt-4 text-white/55">
              Coming soon.
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  )
}