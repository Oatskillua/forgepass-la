import { Search } from 'lucide-react'
import { analyticsEvents } from '../config/analyticsEvents'
import { trackEvent } from '../lib/analytics'

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Search',
}) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <Search className="h-5 w-5 text-white/35" />

      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value)

          trackEvent(analyticsEvents.SEARCH_USED, {
            placeholder,
            length: event.target.value.length,
          })
        }}
        className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
      />
    </div>
  )
}