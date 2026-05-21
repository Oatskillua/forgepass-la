export default function StatsStrip({ stats = [] }) {
  return (
    <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-white/35">
            {stat.label}
          </p>

          <h3 className="mt-3 text-3xl font-black text-cyan-300">
            {stat.value}
          </h3>

          <p className="mt-2 text-sm text-white/50">
            {stat.detail}
          </p>
        </div>
      ))}
    </div>
  )
}