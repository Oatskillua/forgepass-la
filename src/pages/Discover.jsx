import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Discover() {
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-black text-cyan-300">
          Discover LA
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
          Local discovery, neighborhoods, restaurants, nightlife,
          shopping districts, hidden gems, and curated city routes
          will live here.
        </p>
      </main>

      <Footer />
    </div>
  )
}