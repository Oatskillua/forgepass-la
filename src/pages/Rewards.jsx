import { useMemo, useState } from 'react'

import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import CardGrid from '../components/CardGrid'
import PageCTA from '../components/PageCTA'
import PageFilters from '../components/PageFilters'
import SearchBox from '../components/SearchBox'

import { rewardItems } from '../data/rewardItems'

const filterOptions = [
  'All',
  'Progression',
  'Achievements',
  'Offers',
]

export default function Rewards() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return rewardItems.filter((item) => {
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
      eyebrow="Progression System"
      title="Rewards"
      subtitle="XP, badges, city exploration rewards, early-access perks, merchant offers, and achievement systems."
    >
      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search rewards..."
      />

      <PageFilters
        label="Categories"
        options={filterOptions}
        active={activeFilter}
        onChange={setActiveFilter}
      />

      <CardGrid>
        {filteredItems.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </CardGrid>

      <PageCTA />
    </PageShell>
  )
}