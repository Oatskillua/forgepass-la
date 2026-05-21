export default function InfoCard({ title, category, description, status }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-300/30">
      <div className="mb-5 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-300">
        {status}
      </div>

      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/35">
        {category}
      </p>

      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-white/55">
        {description}
      </p>
    </div>
  )
}