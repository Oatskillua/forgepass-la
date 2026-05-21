import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import CardGrid from '../components/CardGrid'
import PageCTA from '../components/PageCTA'
import PageHero from '../components/PageHero'
import EmptyState from '../components/EmptyState'

import { discoverItems } from '../data/discoverItems'
import { useFilteredItems } from '../hooks/useFilteredItems'

const filterOptions = [
  'All',
  'Neighborhood',
  'Coastal Route',
  'Entertainment',
]

const stats = [
  { label: 'Zones', value: '3', detail: 'Initial discovery areas' },
  { label: 'Focus', value: 'LA 2028', detail: 'Tourism expansion ready' },
  { label: 'Mode', value: 'Curated', detail: 'Quality-first listings' },
  { label: 'Status', value: 'MVP', detail: 'Foundation active' },
]

export default function Discover() {
  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredItems,
  } = useFilteredItems(discoverItems)

  return (
    <PageShell
      eyebrow="City Discovery"
      title="Discover LA"
      subtitle="Local discovery, neighborhoods, restaurants, nightlife, shopping districts, hidden gems, and curated city routes."
    >
      <PageHero
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search discovery zones..."
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