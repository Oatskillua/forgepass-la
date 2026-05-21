import { useMemo, useState } from 'react'

import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import CardGrid from '../components/CardGrid'
import PageCTA from '../components/PageCTA'
import PageFilters from '../components/PageFilters'
import SearchBox from '../components/SearchBox'
import EmptyState from '../components/EmptyState'

import { eventItems } from '../data/eventItems'

const filterOptions = [
  'All',
  'Olympic Adjacent',
  'After Hours',
  'Experiences',
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
      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search events and experiences..."
      />

      <PageFilters
  label="Categories"
  options={filterOptions}
  active={activeFilter}
  onChange={setActiveFilter}
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