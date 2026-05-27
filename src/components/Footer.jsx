import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 pt-10">
      <div className="flex flex-col items-center justify-between gap-6 text-sm text-white/40 md:flex-row">
        <p>
          ForgePass LA — Navigate the City. Unlock the Experience.
        </p>

        <div className="flex items-center gap-5">
          <Link
            to="/privacy"
            className="transition hover:text-cyan-300"
          >
            Privacy
          </Link>

          <Link
            to="/terms"
            className="transition hover:text-cyan-300"
          >
            Terms
          </Link>

          <Link
            to="/status"
            className="transition hover:text-cyan-300"
          >
            Status
          </Link>

          <Link
            to="/contact"
            className="transition hover:text-cyan-300"
          >
            Contact
          </Link>

          <Link
            to="/security"
            className="transition hover:text-cyan-300"
          >
            Security
          </Link>
        </div>
      </div>
    </footer>
  )
}