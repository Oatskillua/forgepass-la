import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import CardGrid from '../components/CardGrid'
import PageCTA from '../components/PageCTA'
import PageHero from '../components/PageHero'
import EmptyState from '../components/EmptyState'

import { rewardItems } from '../data/rewardItems'
import { useFilteredItems } from '../hooks/useFilteredItems'

const filterOptions = [
  'All',
  'Progression',
  'Achievements',
  'Offers',
]

const stats = [
  { label: 'Systems', value: '3', detail: 'Reward layers designed' },
  { label: 'Progression', value: 'XP', detail: 'User advancement planned' },
  { label: 'Perks', value: 'Partner', detail: 'Merchant integrations planned' },
  { label: 'Status', value: 'Building', detail: 'Reward engine foundation' },
]

export default function Rewards() {
  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredItems,
  } = useFilteredItems(rewardItems)

  return (
    <PageShell
      eyebrow="Progression System"
      title="Rewards"
      subtitle="XP, badges, city exploration rewards, early-access perks, merchant offers, and achievement systems."
    >
      <PageHero
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search rewards..."
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