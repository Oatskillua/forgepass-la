import { NavLink } from 'react-router-dom'
import { analyticsEvents } from '../config/analyticsEvents'
import { navigationItems } from '../config/navigation'
import { trackEvent } from '../lib/analytics'

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#070B14]/90 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() =>
                trackEvent(analyticsEvents.NAVIGATION_CLICKED, {
                  location: 'mobile',
                  route: item.to,
                  label: item.label,
                })
              }
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-3 text-xs transition ${
                  isActive
                    ? 'text-cyan-300'
                    : 'text-white/45'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}