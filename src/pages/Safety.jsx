import PageShell from '../components/PageShell'

export default function Safety() {
  return (
    <PageShell
      title="Safety"
      subtitle="Crowd awareness, alerts, safer navigation, transit visibility, and trusted experience signals."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {['Crowd Signals', 'Transit Alerts', 'Trusted Routes'].map((item) => (
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