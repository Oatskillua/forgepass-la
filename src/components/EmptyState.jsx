import { SearchX } from 'lucide-react'

export default function EmptyState({
  title = 'No results found',
  subtitle = 'Try a different search term or category filter.',
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
      <SearchX className="mx-auto mb-5 h-10 w-10 text-white/30" />

      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-white/50">
        {subtitle}
      </p>
    </div>
  )
}