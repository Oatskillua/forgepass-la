import StatusBadge from './StatusBadge'

import { trackEvent } from '../lib/analytics'

export default function InfoCard({
  title,
  category,
  description,
  status,
}) {
  return (
    <button
  type="button"
  onClick={() =>
    trackEvent('info_card_clicked', {
      title,
      status,
    })
  }
  className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-cyan-300/30 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
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
    </button>
  )
}