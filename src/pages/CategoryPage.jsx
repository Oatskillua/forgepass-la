import PageShell from '../components/PageShell'
import InfoCard from '../components/InfoCard'
import CardGrid from '../components/CardGrid'
import PageCTA from '../components/PageCTA'
import PageHero from '../components/PageHero'
import EmptyState from '../components/EmptyState'
import ContentSection from '../components/ContentSection'
import PageModule from '../components/PageModule'
import RoadmapModule from '../components/RoadmapModule'

import { useFilteredItems } from '../hooks/useFilteredItems'

export default function CategoryPage({ config, children }) {
  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredItems,
  } = useFilteredItems(config.items)

  return (
    <PageShell
      eyebrow={config.eyebrow}
      title={config.title}
      subtitle={config.subtitle}
    >
      <PageHero
        stats={config.stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder={config.searchPlaceholder}
        filterLabel="Categories"
        filterOptions={config.filterOptions}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        resultCount={filteredItems.length}
      />

      <ContentSection
        title="Available Categories"
        subtitle="Explore currently indexed platform content."
      >
        <PageModule>
          {filteredItems.length > 0 ? (
            <CardGrid>
              {filteredItems.map((item) => (
                <InfoCard key={item.title} {...item} />
              ))}
            </CardGrid>
          ) : (
            <EmptyState />
          )}
        </PageModule>
      </ContentSection>

      <ContentSection
        title="Roadmap"
        subtitle="Upcoming platform systems planned for future releases."
      >
        <PageModule>
          <RoadmapModule items={config.roadmap} />
        </PageModule>
      </ContentSection>

      {children}

      <PageCTA />
    </PageShell>
  )
}