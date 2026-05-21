export default function PageFilters({ label = 'Filter', options = [] }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/35">
        {label}
      </span>

      {options.map((option) => (
        <button
          key={option}
          type="button"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-cyan-300"
        >
          {option}
        </button>
      ))}
    </div>
  )
}