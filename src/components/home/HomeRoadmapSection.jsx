import RoadmapModule from '../RoadmapModule'
import PageModule from '../PageModule'
import { homeRoadmapItems } from '../../data/homeRoadmapItems'

export default function HomeRoadmapSection() {
  return (
    <section className="mb-20 lg:mb-32">
      <div className="mb-10 text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
          Build Roadmap
        </p>

        <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
          From waitlist to city access platform.
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-white/60">
          ForgePass LA is being built in controlled phases so the product can
          scale from MVP infrastructure into a real-time tourism operating layer.
        </p>
      </div>

      <PageModule>
        <RoadmapModule items={homeRoadmapItems} />
      </PageModule>
    </section>
  )
}