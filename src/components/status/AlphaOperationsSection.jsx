import HomeSectionHeader from '../home/HomeSectionHeader'
import HomeGrid from '../home/HomeGrid'
import HomeCard from '../home/HomeCard'
import Badge from '../Badge'
import { Link } from 'react-router-dom'

import { alphaOperations } from '../../data/alphaOperations'

const statusTones = {
  Ready: 'green',
  Planned: 'yellow',
  Partial: 'cyan',
  Pending: 'yellow',
}

export default function AlphaOperationsSection() {
  return (
    <section className="mt-20">
      <HomeSectionHeader
        eyebrow="Alpha Operations"
        title="Controlled Tester Readiness"
        subtitle="Operational systems required for controlled alpha testing, feedback review, trust posture, monitoring, and rollout control."
        align="left"
      />

      <HomeGrid columns="three">
        {alphaOperations.map((item) => (
          <HomeCard key={item.title} className="h-full">
            <Badge tone={statusTones[item.status] || 'white'} className="mb-5">
              {item.status}
            </Badge>

            <h3 className="text-2xl font-bold">
              {item.title}
            </h3>

            <p className="mt-4 leading-7 text-white/55">
              {item.detail}
            </p>
          </HomeCard>
        ))}
      </HomeGrid>

      <div className="mt-10">
      <Link
        to="/alpha-guide"
        className="inline-flex rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-black transition hover:scale-105"
  >
    View Alpha Tester Guide
  </Link>
</div>

    </section>
  )
}