import { useMemo, useState } from 'react'

import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import CardGrid from '../components/CardGrid'
import PageCTA from '../components/PageCTA'
import PageFilters from '../components/PageFilters'
import SearchBox from '../components/SearchBox'
import EmptyState from '../components/EmptyState'

import { safetyItems } from '../data/safetyItems'

const filterOptions = [
  'All',
  'Awareness',
  'Mobility',
  'Navigation',
]

export default function Safety() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return safetyItems.filter((item) => {
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
      eyebrow="Awareness Network"
      title="Safety"
      subtitle="Crowd awareness, alerts, safer navigation, transit visibility, and trusted experience signals."
    >
      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search safety signals..."
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