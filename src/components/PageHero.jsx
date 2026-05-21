import StatsStrip from './StatsStrip'
import SearchBox from './SearchBox'
import PageFilters from './PageFilters'

export default function PageHero({
  stats,
  searchQuery,
  setSearchQuery,
  searchPlaceholder,
  filterLabel,
  filterOptions,
  activeFilter,
  setActiveFilter,
  resultCount,
}) {
  return (
    <>
      <StatsStrip stats={stats} />

      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={searchPlaceholder}
      />

      <PageFilters
        label={filterLabel}
        options={filterOptions}
        active={activeFilter}
        onChange={setActiveFilter}
        resultCount={resultCount}
      />
    </>
  )
}