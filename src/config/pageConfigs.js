import { discoverItems } from '../data/discoverItems'
import { eventItems } from '../data/eventItems'
import { rewardItems } from '../data/rewardItems'
import { safetyItems } from '../data/safetyItems'

export const pageConfigs = {
  discover: {
    eyebrow: 'City Discovery',
    title: 'Discover LA',
    subtitle:
      'Local discovery, neighborhoods, restaurants, nightlife, shopping districts, hidden gems, and curated city routes.',
    searchPlaceholder: 'Search discovery zones...',
    filterOptions: ['All', 'Neighborhood', 'Coastal Route', 'Entertainment'],
    items: discoverItems,
    stats: [
      { label: 'Zones', value: '3', detail: 'Initial discovery areas' },
      { label: 'Focus', value: 'LA 2028', detail: 'Tourism expansion ready' },
      { label: 'Mode', value: 'Curated', detail: 'Quality-first listings' },
      { label: 'Status', value: 'MVP', detail: 'Foundation active' },
    ],
    roadmap: [
      {
        title: 'Neighborhood Profiles',
        description:
          'Detailed area pages with highlights, transit access, safety notes, and visitor tips.',
      },
      {
        title: 'Curated Routes',
        description:
          'Recommended city paths for food, nightlife, landmarks, and Olympic-adjacent travel.',
      },
      {
        title: 'Saved Places',
        description:
          'Users will save locations and build personal LA itineraries.',
      },
    ],
  },

  events: {
    eyebrow: 'Live Experiences',
    title: 'Events',
    subtitle:
      'Olympic-adjacent experiences, fan zones, concerts, nightlife, pop-ups, and curated activity listings.',
    searchPlaceholder: 'Search events and experiences...',
    filterOptions: ['All', 'Olympic Adjacent', 'After Hours', 'Experiences'],
    items: eventItems,
    stats: [
      { label: 'Experiences', value: '3', detail: 'Event systems initialized' },
      { label: 'Coverage', value: 'Citywide', detail: 'Olympic tourism focus' },
      { label: 'Access', value: 'Live', detail: 'Real-time expansion planned' },
      { label: 'Status', value: 'Active', detail: 'Event framework online' },
    ],
    roadmap: [
      {
        title: 'Live Event Listings',
        description:
          'Dynamic event feeds for fan zones, pop-ups, nightlife, concerts, and local activations.',
      },
      {
        title: 'Event Alerts',
        description:
          'Notifications for schedule changes, crowd levels, access windows, and nearby activity.',
      },
      {
        title: 'Access Passes',
        description:
          'Future gated access, reservations, and early-entry systems.',
      },
    ],
  },

  rewards: {
    eyebrow: 'Progression System',
    title: 'Rewards',
    subtitle:
      'XP, badges, city exploration rewards, early-access perks, merchant offers, and achievement systems.',
    searchPlaceholder: 'Search rewards...',
    filterOptions: ['All', 'Progression', 'Achievements', 'Offers'],
    items: rewardItems,
    stats: [
      { label: 'Systems', value: '3', detail: 'Reward layers designed' },
      { label: 'Progression', value: 'XP', detail: 'User advancement planned' },
      { label: 'Perks', value: 'Partner', detail: 'Merchant integrations planned' },
      { label: 'Status', value: 'Building', detail: 'Reward engine foundation' },
    ],
    roadmap: [
      {
        title: 'XP Engine',
        description:
          'Progression points for checking in, exploring routes, and completing city challenges.',
      },
      {
        title: 'Badge System',
        description:
          'Unlockable achievements tied to neighborhoods, events, and platform activity.',
      },
      {
        title: 'Merchant Perks',
        description:
          'Partner rewards, discounts, and exclusive local offers.',
      },
    ],
  },

  safety: {
    eyebrow: 'Awareness Network',
    title: 'Safety',
    subtitle:
      'Crowd awareness, alerts, safer navigation, transit visibility, and trusted experience signals.',
    searchPlaceholder: 'Search safety signals...',
    filterOptions: ['All', 'Awareness', 'Mobility', 'Navigation'],
    items: safetyItems,
    stats: [
      { label: 'Signals', value: '3', detail: 'Awareness systems planned' },
      { label: 'Transit', value: 'Monitored', detail: 'Mobility layer planned' },
      { label: 'Routing', value: 'Adaptive', detail: 'Safer navigation focus' },
      { label: 'Status', value: 'Developing', detail: 'Safety framework active' },
    ],
    roadmap: [
      {
        title: 'Crowd Layer',
        description:
          'Area-level crowd awareness and high-traffic zone indicators.',
      },
      {
        title: 'Transit Signals',
        description:
          'Mobility alerts for routes, closures, congestion, and visitor corridors.',
      },
      {
        title: 'Trusted Pathing',
        description:
          'Route suggestions designed around clarity, visibility, and visitor confidence.',
      },
    ],
  },
}