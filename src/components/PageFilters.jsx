import { trackEvent } from '../lib/analytics'
import { analyticsEvents } from '../config/analyticsEvents'

export default function PageFilters({
  label = 'Filter',
  options = [],
  active,
  onChange,
  resultCount,
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/35">
          {label}
        </span>

        {options.map((option) => {
          const isActive = active === option

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option)

                trackEvent(analyticsEvents.CATEGORY_FILTER_CLICKED, {
                  label,
                  option,
                })
              }}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-300'
                  : 'border-white/10 bg-white/[0.04] text-white/60 hover:border-cyan-300/30 hover:text-cyan-300'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {typeof resultCount === 'number' && (
        <p className="text-sm text-white/40">
          {resultCount} result{resultCount === 1 ? '' : 's'}
        </p>
      )}
    </div>
  )
}