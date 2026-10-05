import StatusBadge from './StatusBadge'
import { analyticsEvents } from '../config/analyticsEvents'
import { trackEvent } from '../lib/analytics'

export default function InfoCard({
  title,
  category,
  description,
  status,
  actionLabel,
  onAction,
  actionDisabled = false,
  children,
}) {
  return (
    <article
      className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-cyan-300/30"
    >
      <StatusBadge status={status} />

      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/35">
        {category}
      </p>

      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-white/55">
        {description}
      </p>

      {onAction && (
        <button
          type="button"
          disabled={actionDisabled}
          onClick={() => {
            trackEvent(analyticsEvents.INFO_CARD_CLICKED, { title, status })
            onAction()
          }}
          className="mt-5 rounded-xl border border-cyan-300/30 px-4 py-2 text-sm font-bold text-cyan-200 disabled:opacity-60"
        >
          {actionLabel}
        </button>
      )}
      {children}
    </article>
  )
}
