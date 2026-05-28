import HomeSectionHeader from '../home/HomeSectionHeader'
import HomeGrid from '../home/HomeGrid'
import HomeCard from '../home/HomeCard'

import { deploymentStatus } from '../../data/deploymentStatus'

export default function DeploymentStatusSection() {
  return (
    <section className="mt-20">
      <HomeSectionHeader
        eyebrow="Deployment Visibility"
        title="Deployment Environment"
        subtitle="ForgePass LA publicly exposes deployment-stage metadata, release channels, and operational build visibility."
        align="left"
      />

      <HomeGrid columns="four">
        {deploymentStatus.map((item) => (
          <HomeCard key={item.label} className="h-full">
            <p className="text-sm uppercase tracking-[0.2em] text-white/35">
              {item.label}
            </p>

            <h3 className="mt-3 text-3xl font-black">
              {item.value}
            </h3>

            <p className="mt-4 leading-7 text-white/55">
              {item.detail}
            </p>
          </HomeCard>
        ))}
      </HomeGrid>
    </section>
  )
}