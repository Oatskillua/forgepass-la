import Header from '../components/Header'
import Footer from '../components/Footer'
import WaitlistForm from '../components/WaitlistForm'
import MobileNav from '../components/MobileNav'

import HeroSection from '../components/home/HeroSection'
import FeatureSection from '../components/home/FeatureSection'
import SystemPreviewSection from '../components/home/SystemPreviewSection'
import CityIntelligenceSection from '../components/home/CityIntelligenceSection'
import TrustStrip from '../components/home/TrustStrip'

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(0,174,239,0.15),transparent_40%),radial-gradient(circle_at_right,rgba(0,255,255,0.08),transparent_35%)]" />

      <main className="relative z-10">
        <Header />

        <section className="mx-auto max-w-7xl px-5 py-10 pb-28 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <HeroSection />

          <FeatureSection />

          <SystemPreviewSection />

          <CityIntelligenceSection />

          <section
            id="waitlist"
            className="mx-auto max-w-3xl scroll-mt-10"
          >
            <WaitlistForm />
          </section>

          <TrustStrip />

          <Footer />
        </section>
      </main>

      <MobileNav />
    </div>
  )
}