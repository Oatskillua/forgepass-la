import Header from './Header'
import Footer from './Footer'

export default function PageShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(0,174,239,0.12),transparent_40%)]" />

      <main className="relative z-10">
        <Header />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-14">
            <h1 className="text-4xl font-black tracking-tight text-cyan-300 sm:text-5xl">
              {title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
              {subtitle}
            </p>
          </div>

          {children}

          <Footer />
        </section>
      </main>
    </div>
  )
}