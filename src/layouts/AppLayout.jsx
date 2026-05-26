import Header from '../components/Header'
import Footer from '../components/Footer'
import MobileNav from '../components/MobileNav'
import { usePageTitle } from '../hooks/usePageTitle'
import ScrollToTop from '../components/ScrollToTop'
import { useTrackRouteDuration } from '../hooks/useTrackRouteDuration'
import { useTrackPageView } from '../hooks/useTrackPageView'

export default function AppLayout({ children }) {
  usePageTitle()
  useTrackPageView()
  useTrackRouteDuration()
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(0,174,239,0.12),transparent_40%)]" />

      <main className="relative z-10">
      <ScrollToTop />
        <Header />

        <section className="mx-auto max-w-7xl px-5 py-20 pb-28 sm:px-6 lg:px-8">
          {children}

          <Footer />
        </section>
      </main>

      <MobileNav />
    </div>
  )
}