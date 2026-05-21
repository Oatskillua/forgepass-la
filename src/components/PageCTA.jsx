import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function PageCTA({
  title = 'Join the ForgePass LA waitlist',
  subtitle = 'Get early access as the platform develops toward LA 2028.',
  buttonText = 'Join Early Access',
  to = '/#waitlist',
}) {
  return (
    <div className="mt-16 rounded-[32px] border border-cyan-300/20 bg-cyan-300/10 p-8 text-center shadow-[0_0_60px_rgba(0,255,255,0.08)]">
      <h2 className="text-3xl font-black">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-white/60">
        {subtitle}
      </p>

      <Link
        to={to}
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-black transition hover:scale-105"
      >
        {buttonText}
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  )
}