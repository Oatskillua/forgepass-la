import { Activity } from 'lucide-react'
import { liveMetrics } from '../../data/liveMetrics'
import { liveMetricsConfig } from '../../data/liveMetricsConfig'

export default function LiveMetricsSection() {
  return (
    <section className="mb-20 lg:mb-32">
      <div className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
          <Activity className="h-4 w-4" />
          {liveMetricsConfig.eyebrow}
        </div>

        <h2 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
          {liveMetricsConfig.title}
        </h2>

        <p className="mt-5 max-w-3xl leading-8 text-white/60">
          {liveMetricsConfig.description}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {liveMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
          >
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-cyan-300">
              {metric.status}
            </div>

            <p className="text-sm uppercase tracking-[0.2em] text-white/35">
              {metric.label}
            </p>

            <h3 className="mt-3 text-3xl font-black">
              {metric.value}
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/50">
              {metric.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}