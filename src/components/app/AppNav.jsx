import { NavLink } from 'react-router-dom'

const items = [
  ['/app', 'Overview'],
  ['/app/saved', 'Saved'],
  ['/app/itineraries', 'Itineraries'],
  ['/app/rewards', 'Rewards'],
  ['/app/alerts', 'Alerts'],
  ['/app/profile', 'Profile'],
]

export default function AppNav() {
  return (
    <nav aria-label="Account" className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-2">
      {items.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/app'}
          className={({ isActive }) => `whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${
            isActive ? 'bg-cyan-300 text-black' : 'text-white/60 hover:text-white'
          }`}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
