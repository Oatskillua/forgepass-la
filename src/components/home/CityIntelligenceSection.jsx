import { Zap } from 'lucide-react'

import { citySystems } from '../../data/citySystems'
import { cityIntelligenceConfig } from '../../data/cityIntelligenceConfig'

export default function CityIntelligenceSection() {
  return (
    <section className="mb-20 lg:mb-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 sm:mb-8">
            <Zap className="h-4 w-4 shrink-0 text-cyan-300" />

            <span className="text-xs text-white/70 sm:text-sm">
              {cityIntelligenceConfig.eyebrow}
            </span>
          </div>

          <h2 className="mb-6 text-3xl font-black leading-tight sm:text-4xl md:text-5xl lg:mb-8 lg:text-6xl">
            {cityIntelligenceConfig.title}
          </h2>

          <p className="mb-8 text-base leading-8 text-white/60 sm:text-lg sm:leading-9 lg:mb-10">
            {cityIntelligenceConfig.description}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {citySystems.map((system) => {
              const Icon = system.icon

              return (
                <div
                  key={system.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <Icon className="mb-4 h-6 w-6 text-cyan-300" />

                  <h4 className="mb-2 font-bold">{system.title}</h4>

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
                  <span className="text-cyan-300">Active</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm sm:text-base">
                  <span>LA Live District</span>
                  <span className="text-cyan-300">Moderate</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm sm:text-base">
                  <span>Santa Monica</span>
                  <span className="text-green-300">Clear</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}