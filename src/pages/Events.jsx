import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Events() {
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-black text-cyan-300">
          Events
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
          Event access, Olympic-adjacent experiences, fan zones,
          concerts, nightlife, and curated activity listings will
          live here.
        </p>
      </main>

      <Footer />
    </div>
  )
}