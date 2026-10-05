import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './auth/AuthContext'
import PwaUpdatePrompt from './components/PwaUpdatePrompt'
import { supabaseConfigurationError } from './lib/supabase'

export default function App() {
  if (supabaseConfigurationError) {
    return <main className="grid min-h-screen place-items-center bg-[#0B0F1A] p-6 text-white">
      <div role="alert" className="max-w-lg space-y-4 rounded-3xl border border-white/15 p-8">
        <h1 className="text-2xl font-bold">ForgePass is temporarily unavailable</h1>
        <p>The app could not connect because its service settings are incomplete. Please try again later.</p>
        {import.meta.env.DEV && <p className="text-sm text-white/60">{supabaseConfigurationError}</p>}
      </div>
    </main>
  }
  return (
    <AuthProvider>
      <Suspense
        fallback={(
          <div
            className="grid min-h-screen place-items-center bg-[#0B0F1A] text-sm font-semibold text-cyan-200"
            role="status"
            aria-live="polite"
          >
            Loading ForgePass LA…
          </div>
        )}
      >
        <RouterProvider router={router} />
        <PwaUpdatePrompt />
      </Suspense>
    </AuthProvider>
  )
}
