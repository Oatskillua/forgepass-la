import { NavLink } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { analyticsEvents } from '../config/analyticsEvents'
import { navigationItems } from '../config/navigation'
import { trackEvent } from '../lib/analytics'

export default function Header() {
  return (
    <header className="relative z-20 border-b border-white/10 bg-[#070B14]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10">
            <Compass className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <p className="text-sm font-black tracking-[0.22em] text-white">
              FORGEPASS
            </p>

            <p className="text-xs tracking-[0.35em] text-cyan-300">
              LA
            </p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-3 text-sm text-white/60 md:flex">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() =>
                trackEvent(analyticsEvents.NAVIGATION_CLICKED, {
                  location: 'header',
                  route: item.to,
                  label: item.label,
                })
              }
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition ${
                  isActive
                    ? 'bg-cyan-300/10 text-cyan-300'
                    : 'hover:bg-white/5 hover:text-cyan-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <a
          href="/#waitlist"
          onClick={() =>
            trackEvent(analyticsEvents.NAVIGATION_JOIN_CLICKED, {
              location: 'header',
            })
          }
          className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-black transition hover:scale-105"
        >
          Join
        </a>
      </div>
    </header>
  )
}