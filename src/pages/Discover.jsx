import PageShell from '../components/PageShell'

export default function Discover() {
  return (
    <PageShell
      title="Discover LA"
      subtitle="Local discovery, neighborhoods, restaurants, nightlife, shopping districts, hidden gems, and curated city routes."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {['Neighborhoods', 'Food + Nightlife', 'Hidden Gems'].map((item) => (
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