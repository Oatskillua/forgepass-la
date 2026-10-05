import PageShell from '../components/PageShell'
import { cityIntelligenceProviders } from '../data/cityIntelligenceProviders'

export default function CityIntelligence() {
  return (
    <PageShell eyebrow="Live City Intelligence" title="Los Angeles operating picture" subtitle="Time-sensitive transportation, weather, congestion, and city information with visible freshness and source status.">
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-6 text-amber-100">Live providers are not configured. No stale, sample, or simulated information is being presented as current.</div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {cityIntelligenceProviders.map((provider) => <section key={provider.id} className="rounded-3xl border border-white/10 bg-white/5 p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-white/35">{provider.source}</p><h2 className="mt-2 text-xl font-bold">{provider.title}</h2></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">Not configured</span></div><p className="mt-4 leading-7 text-white/55">{provider.description}</p><p className="mt-4 text-xs text-white/35">Last updated: unavailable</p></section>)}
      </div>
    </PageShell>
  )
}
