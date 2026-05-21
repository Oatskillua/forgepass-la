import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(0,174,239,0.12),transparent_40%)]" />

      <main className="relative z-10">
        <Header />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          {children}

          <Footer />
        </section>
      </main>
    </div>
  )
}