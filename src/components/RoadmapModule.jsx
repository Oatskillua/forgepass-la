import { Rocket } from 'lucide-react'

export default function RoadmapModule({ items = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-3xl border border-white/10 bg-black/20 p-5"
        >
          <Rocket className="mb-4 h-6 w-6 text-cyan-300" />

          <h3 className="font-bold">
            {item.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/50">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}