import Hero from './components/Hero'
import FeatureCard from './components/FeatureCard'
import WaitlistForm from './components/WaitlistForm'
import Footer from './components/Footer'
import { MapPin, Shield, Ticket, Users, Zap } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <Hero />

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <FeatureCard
            icon={Ticket}
            title="Event Access"
            text="Discover experiences around LA during the Olympic tourism surge."
          />

          <FeatureCard
            icon={MapPin}
            title="Local Discovery"
            text="Find hidden gems, nightlife, restaurants, and tourism hubs."
          />

          <FeatureCard
            icon={Shield}
            title="Trusted Platform"
            text="Secure onboarding, curated experiences, and verified access systems."
          />
        </div>

        <WaitlistForm />

        <div className="mt-20 flex items-center justify-center gap-10 text-white/40">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Early Community
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Secure Access
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            LA 2028 Ready
          </div>
        </div>

        <Footer />
      </section>
    </div>
  )
}