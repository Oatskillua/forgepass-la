import HomeSectionHeader from '../home/HomeSectionHeader'
import HomeGrid from '../home/HomeGrid'
import HomeCard from '../home/HomeCard'
import { Link } from 'react-router-dom'
import { alphaWorkflow } from '../../data/alphaWorkflow'

export default function AlphaWorkflowSection() {
  return (
    <section className="mt-20">
      <HomeSectionHeader
        eyebrow="Onboarding Process"
        title="Alpha Tester Workflow"
        subtitle="The structured path from waitlist registration through platform evaluation and feedback-driven iteration."
        align="left"
      />

      <HomeGrid columns="three">
        {alphaWorkflow.map((item) => (
          <HomeCard key={item.step} className="h-full">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              Step {item.step}
            </p>

            <h3 className="mt-3 text-2xl font-bold">
              {item.title}
            </h3>

            <p className="mt-4 leading-7 text-white/55">
              {item.detail}
            </p>
          </HomeCard>
        ))}
      </HomeGrid>

     <div className="mt-10 flex flex-wrap gap-4">
  <Link
    to="/feedback"
    className="inline-flex rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-black transition hover:scale-105"
  >
    Submit Alpha Feedback
  </Link>

  <Link
    to="/alpha-guide"
    className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-cyan-300/30 hover:text-cyan-300"
  >
    View Tester Guide
  </Link>
</div>
    </section>
  )
}