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
    text: 'Optimized travel routes and congestion-aware movement through LA.',
  },
  {
    icon: Trophy,
    title: 'Rewards Engine',
    text: 'Earn rewards, achievements, and perks through exploration.',
  },
  {
    icon: Bell,
    title: 'Alerts + Notifications',
    text: 'Updates on schedules, crowds, venue changes, and safety alerts.',
  },
]

export default function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(0,174,239,0.15),transparent_40%),radial-gradient(circle_at_right,rgba(0,255,255,0.08),transparent_35%)]" />

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 backdrop-blur-md sm:mb-8 sm:px-5">
              <Sparkles className="h-4 w-4 shrink-0 text-cyan-300" />

              <span className="text-xs tracking-wide text-cyan-100 sm:text-sm">
                LA 2028 Tourism Access Platform
              </span>
            </div>

            <h1 className="mx-auto mb-6 max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Navigate Los Angeles
              <br />
              <span className="text-cyan-300">
                Like Never Before
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-base leading-8 text-white/65 sm:text-lg md:text-xl lg:text-2xl lg:leading-9">
              ForgePass LA combines live city intelligence,
              tourism discovery, transportation awareness,
              rewards, event access, and local experiences
              into one unified platform built for the 2028
              Olympic expansion.
            </p>

            <div className="mb-14 flex flex-col justify-center gap-4 sm:mb-20 sm:flex-row sm:gap-5">
              <a
                href="#waitlist"
                className="rounded-2xl bg-cyan-300 px-6 py-4 text-base font-bold text-black shadow-[0_0_40px_rgba(0,255,255,0.25)] transition hover:scale-105 sm:px-8 sm:text-lg"
              >
                Join Early Access
              </a>

              <a
                href="#features"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold backdrop-blur-md transition hover:bg-white/10 sm:px-8 sm:text-lg"
              >
                Explore Features
              </a>
            </div>
          </motion.div>

          <div
            id="features"
            className="mb-20 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 lg:mb-28"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:border-cyan-300/30 sm:p-8"
                >
                  <Icon className="mb-5 h-9 w-9 text-cyan-300 sm:mb-6 sm:h-10 sm:w-10" />

                  <h3 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                    {feature.text}
                  </p>
                </motion.div>
              )
            })}
          </div>

          <section className="mb-20 lg:mb-32">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 sm:mb-8">
                  <Zap className="h-4 w-4 shrink-0 text-cyan-300" />

                  <span className="text-xs text-white/70 sm:text-sm">
                    Real-Time Infrastructure
                  </span>
                </div>

                <h2 className="mb-6 text-3xl font-black leading-tight sm:text-4xl md:text-5xl lg:mb-8 lg:text-6xl">
                  Built for the
                  <br />
                  Next Generation
                  <br />
                  of City Navigation
                </h2>

                <p className="mb-8 text-base leading-8 text-white/60 sm:text-lg sm:leading-9 lg:mb-10">
                  ForgePass LA is designed to help visitors,
                  tourists, residents, and event attendees
                  move through Los Angeles with greater
                  awareness, efficiency, safety, and
                  discovery during one of the largest tourism
                  expansions in modern US history.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  {systems.map((system) => {
                    const Icon = system.icon

                    return (
                      <div
                        key={system.title}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                      >
                        <Icon className="mb-4 h-6 w-6 text-cyan-300" />

                        <h4 className="mb-2 font-bold">
                          {system.title}
                        </h4>

                        <p className="text-sm leading-7 text-white/55">
                          {system.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/20 blur-[90px] sm:blur-[120px]" />

                <div className="relative rounded-[28px] border border-cyan-300/20 bg-white/[0.04] p-4 shadow-[0_0_80px_rgba(0,255,255,0.15)] backdrop-blur-2xl sm:rounded-[40px] sm:p-8">
                  <div className="rounded-[24px] border border-white/10 bg-[#0A1220] p-4 sm:rounded-[30px] sm:p-6">
                    <div className="mb-6 flex items-center justify-between sm:mb-8">
                      <div>
                        <p className="text-xs text-white/40 sm:text-sm">
                          Active City Status
                        </p>

                        <h3 className="mt-1 text-xl font-bold sm:text-2xl">
                          Los Angeles
                        </h3>
                      </div>

                      <div className="h-4 w-4 rounded-full bg-green-400 animate-pulse" />
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2">
                      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                        <p className="mb-1 text-xs text-white/50 sm:text-sm">
                          Crowd Activity
                        </p>

                        <h4 className="text-2xl font-black text-cyan-300 sm:text-3xl">
                          Moderate
                        </h4>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="mb-1 text-xs text-white/50 sm:text-sm">
                          Transit
                        </p>

                        <h4 className="text-2xl font-black sm:text-3xl">
                          Stable
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm sm:text-base">
                        <span>Olympic Village</span>
                        <span className="text-cyan-300">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm sm:text-base">
                        <span>LA Live District</span>
                        <span className="text-cyan-300">
                          Moderate
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm sm:text-base">
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
            className="mx-auto max-w-3xl scroll-mt-10"
          >
            <WaitlistForm />
          </section>

          <div className="mt-16 flex flex-col items-center justify-center gap-5 text-white/40 sm:mt-24 sm:flex-row sm:flex-wrap sm:gap-10">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Early Community
            </div>

            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Secure Access
            </div>

            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              LA 2028 Ready
            </div>
          </div>

          <Footer />
        </section>
      </main>
    </div>
  )
}