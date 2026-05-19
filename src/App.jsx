import { motion } from 'framer-motion'
import {
  MapPin,
  Shield,
  Ticket,
  Users,
  Zap,
  Sparkles,
  Trophy,
  Globe,
  Route,
  Bell,
} from 'lucide-react'

import WaitlistForm from './components/WaitlistForm'
import Footer from './components/Footer'

const features = [
  {
    icon: Ticket,
    title: 'Event Access',
    text: 'Discover sports, nightlife, concerts, fan zones, and Olympic tourism experiences across Los Angeles.',
  },
  {
    icon: MapPin,
    title: 'Local Discovery',
    text: 'Find hidden gems, restaurants, shopping districts, and curated city experiences.',
  },
  {
    icon: Shield,
    title: 'Trusted Platform',
    text: 'Secure onboarding, verified experiences, crowd visibility, and safer navigation systems.',
  },
]

const systems = [
  {
    icon: Globe,
    title: 'Live City Intelligence',
    text: 'Real-time awareness for events, traffic, transit, and city movement.',
  },
  {
    icon: Route,
    title: 'Smart Navigation',
    text: 'Navigate LA with optimized travel routes and congestion awareness.',
  },
  {
    icon: Trophy,
    title: 'Rewards Engine',
    text: 'Earn rewards, achievements, and perks through exploration and activity.',
  },
  {
    icon: Bell,
    title: 'Alerts + Notifications',
    text: 'Receive updates on schedules, crowds, venue changes, and safety alerts.',
  },
]

export default function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(0,174,239,0.15),transparent_40%),radial-gradient(circle_at_right,rgba(0,255,255,0.08),transparent_35%)]" />

      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 backdrop-blur-md mb-8">
              <Sparkles className="w-4 h-4 text-cyan-300" />

              <span className="text-sm tracking-wide text-cyan-100">
                LA 2028 Tourism Access Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-8">
              Navigate Los Angeles
              <br />
              <span className="text-cyan-300">
                Like Never Before
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-lg md:text-2xl text-white/65 leading-9 mb-14">
              ForgePass LA combines live city intelligence,
              tourism discovery, transportation awareness,
              rewards, event access, and local experiences
              into one unified platform built for the 2028
              Olympic expansion.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
              <a
                href="#waitlist"
                className="px-8 py-4 rounded-2xl bg-cyan-300 text-black font-bold text-lg hover:scale-105 transition shadow-[0_0_40px_rgba(0,255,255,0.25)]"
              >
                Join Early Access
              </a>

              <button className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md font-semibold text-lg hover:bg-white/10 transition">
                Explore Features
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-28">
            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="p-8 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl hover:border-cyan-300/30 transition"
                >
                  <Icon className="w-10 h-10 mb-6 text-cyan-300" />

                  <h3 className="text-2xl font-bold mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-white/60 leading-8">
                    {feature.text}
                  </p>
                </motion.div>
              )
            })}
          </div>

          <section className="mb-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                  <Zap className="w-4 h-4 text-cyan-300" />

                  <span className="text-sm text-white/70">
                    Real-Time Infrastructure
                  </span>
                </div>

                <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8">
                  Built for the
                  <br />
                  Next Generation
                  <br />
                  of City Navigation
                </h2>

                <p className="text-lg text-white/60 leading-9 mb-10">
                  ForgePass LA is designed to help visitors,
                  tourists, residents, and event attendees
                  move through Los Angeles with greater
                  awareness, efficiency, safety, and
                  discovery during one of the largest tourism
                  expansions in modern US history.
                </p>

                <div className="grid sm:grid-cols-2 gap-5">
                  {systems.map((system) => {
                    const Icon = system.icon

                    return (
                      <div
                        key={system.title}
                        className="p-5 rounded-2xl bg-white/[0.04] border border-white/10"
                      >
                        <Icon className="w-6 h-6 mb-4 text-cyan-300" />

                        <h4 className="font-bold mb-2">
                          {system.title}
                        </h4>

                        <p className="text-sm text-white/55 leading-7">
                          {system.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/20 blur-[120px]" />

                <div className="relative rounded-[40px] border border-cyan-300/20 bg-white/[0.04] backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(0,255,255,0.15)]">
                  <div className="rounded-[30px] bg-[#0A1220] border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-sm text-white/40">
                          Active City Status
                        </p>

                        <h3 className="text-2xl font-bold mt-1">
                          Los Angeles
                        </h3>
                      </div>

                      <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 rounded-2xl bg-cyan-400/10 border border-cyan-300/20">
                        <p className="text-sm text-white/50 mb-1">
                          Crowd Activity
                        </p>

                        <h4 className="text-3xl font-black text-cyan-300">
                          Moderate
                        </h4>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-sm text-white/50 mb-1">
                          Transit
                        </p>

                        <h4 className="text-3xl font-black">
                          Stable
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <span>Olympic Village</span>
                        <span className="text-cyan-300">
                          Active
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <span>LA Live District</span>
                        <span className="text-cyan-300">
                          Moderate
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <span>Santa Monica</span>
                        <span className="text-green-300">
                          Clear
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="waitlist"
            className="max-w-3xl mx-auto"
          >
            <WaitlistForm />
          </section>

          <div className="mt-24 flex flex-wrap items-center justify-center gap-10 text-white/40">
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
      </main>
    </div>
  )
}