import PageShell from '../components/PageShell'

export default function Rewards() {
  return (
    <PageShell
      title="Rewards"
      subtitle="XP, badges, city exploration rewards, early-access perks, merchant offers, and achievement systems."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {['XP System', 'Badges', 'Partner Perks'].map((item) => (
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