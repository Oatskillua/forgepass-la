import HomeSectionHeader from '../home/HomeSectionHeader'
import HomeGrid from '../home/HomeGrid'
import HomeCard from '../home/HomeCard'
import Badge from '../Badge'

import { Link } from 'react-router-dom'
import { alphaInviteChecklist } from '../../data/alphaInviteChecklist'

export default function AlphaInviteChecklistSection() {
  return (
    <section className="mt-20">
      <HomeSectionHeader
        eyebrow="Tester Launch"
        title="Alpha Invite Checklist"
        subtitle="Operational steps before inviting the first controlled group of external testers."
        align="left"
      />

      <HomeGrid columns="two">
        {alphaInviteChecklist.map((item) => (
          <HomeCard key={item.title} className="h-full">
            <Badge tone="green" className="mb-5">
              Action
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
    to="/alpha-launch"
    className="inline-flex rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-black transition hover:scale-105"
  >
    Open Alpha Launch Command
  </Link>
</div>

    </section>
  )
}