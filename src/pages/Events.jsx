import CategoryPage from './CategoryPage'
import { pageConfigs } from '../config/pageConfigs'
import LiveEventsSection from '../components/events/LiveEventsSection'

export default function Events() {
  return (
    <>
      <CategoryPage config={pageConfigs.events} />
      <LiveEventsSection />
    </>
  )
}