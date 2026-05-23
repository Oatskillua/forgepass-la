import {
  Activity,
  CalendarDays,
  Compass,
  Gift,
  ShieldCheck,
} from 'lucide-react'

export const homeSystems = [
  {
    title: 'Discover',
    text: 'Explore neighborhoods, hidden gems, local districts, and curated routes.',
    to: '/discover',
    icon: Compass,
  },
  {
    title: 'Events',
    text: 'Track experiences, fan zones, nightlife, concerts, and pop-ups.',
    to: '/events',
    icon: CalendarDays,
  },
  {
    title: 'Rewards',
    text: 'Build XP, badges, perks, and future partner reward systems.',
    to: '/rewards',
    icon: Gift,
  },
  {
    title: 'Safety',
    text: 'View crowd signals, transit alerts, and trusted navigation layers.',
    to: '/safety',
    icon: ShieldCheck,
  },
  {
    title: 'Status',
    text: 'Track production readiness, build progress, and upcoming platform phases.',
    to: '/status',
    icon: Activity,
  },
]