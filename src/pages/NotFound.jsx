import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'

export default function NotFound() {
  return (
    <PageShell
      eyebrow="404"
      title="Page Not Found"
      subtitle="The page you are looking for does not exist or has not been built yet."
    >
      <Link
        to="/"
        className="inline-flex rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-black transition hover:scale-105"
      >
        Return Home
      </Link>
    </PageShell>
  )
}