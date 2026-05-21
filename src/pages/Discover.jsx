import { useMemo, useState } from 'react'

import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import CardGrid from '../components/CardGrid'
import PageCTA from '../components/PageCTA'
import PageFilters from '../components/PageFilters'
import SearchBox from '../components/SearchBox'
import EmptyState from '../components/EmptyState'

import { discoverItems } from '../data/discoverItems'

const filterOptions = [
  'All',
  'Neighborhood',
  'Coastal Route',
  'Entertainment',
]

export default function Discover() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return discoverItems.filter((item) => {
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
      eyebrow="City Discovery"
      title="Discover LA"
      subtitle="Local discovery, neighborhoods, restaurants, nightlife, shopping districts, hidden gems, and curated city routes."
    >
      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search discovery zones..."
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