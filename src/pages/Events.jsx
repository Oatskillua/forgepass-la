import { useMemo, useState } from 'react'

import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import CardGrid from '../components/CardGrid'
import PageCTA from '../components/PageCTA'
import PageHero from '../components/PageHero'
import EmptyState from '../components/EmptyState'

import { eventItems } from '../data/eventItems'

const filterOptions = [
  'All',
  'Olympic Adjacent',
  'After Hours',
  'Experiences',
]

const stats = [
  { label: 'Experiences', value: '3', detail: 'Event systems initialized' },
  { label: 'Coverage', value: 'Citywide', detail: 'Olympic tourism focus' },
  { label: 'Access', value: 'Live', detail: 'Real-time expansion planned' },
  { label: 'Status', value: 'Active', detail: 'Event framework online' },
]

export default function Events() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return eventItems.filter((item) => {
      const matchesFilter =
        activeFilter === 'All' ||
        item.category === activeFilter

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [activeFilter, searchQuery])

  return (
    <PageShell
      eyebrow="Live Experiences"
      title="Events"
      subtitle="Olympic-adjacent experiences, fan zones, concerts, nightlife, pop-ups, and curated activity listings."
    >
      <PageHero
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search events and experiences..."
        filterLabel="Categories"
        filterOptions={filterOptions}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        resultCount={filteredItems.length}
      />

      {filteredItems.length > 0 ? (
        <CardGrid>
          {filteredItems.map((item) => (
            <InfoCard key={item.title} {...item} />
          ))}
        </CardGrid>
      ) : (
        <EmptyState />
      )}

      <PageCTA />
    </PageShell>
  )
}