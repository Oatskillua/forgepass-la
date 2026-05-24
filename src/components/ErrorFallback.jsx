import { Link } from 'react-router-dom'

export default function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070B14] px-5 text-white">
      <div className="max-w-xl text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
          Application Error
        </p>

        <h1 className="text-5xl font-black tracking-tight">
          Something went wrong.
        </h1>

        <p className="mt-6 leading-8 text-white/60">
          ForgePass LA encountered an unexpected rendering or routing error.
          Refresh the page or return home.
        </p>

        <Link
          to="/"
          className="mt-10 inline-flex rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-black transition hover:scale-105"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}