import {
  Compass,
  CalendarDays,
  Gift,
  ShieldCheck,
} from 'lucide-react'

export const navigationItems = [
  {
    label: 'Discover',
    to: '/discover',
    icon: Compass,
  },
  {
    label: 'Events',
    to: '/events',
    icon: CalendarDays,
  },
  {
    label: 'Rewards',
    to: '/rewards',
    icon: Gift,
  },
  {
    label: 'Safety',
    to: '/safety',
    icon: ShieldCheck,
  },
]