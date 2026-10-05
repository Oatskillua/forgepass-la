import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import App from './App'

const provider =
  vi.hoisted(() =>
    vi.fn(() => null)
  )

vi.mock(
  './auth/AuthContext',
  () => ({
    AuthProvider: provider,
  }),
)

vi.mock(
  './router',
  () => ({
    router: {},
  }),
)

vi.mock(
  './lib/supabase',
  () => ({
    supabaseConfigurationError:
      'Missing project configuration',
  }),
)

vi.mock(
  './components/PwaUpdatePrompt',
  () => ({
    default: () => null,
  }),
)

it(
  'shows an unavailable screen without mounting authentication when setup is invalid',
  () => {
    render(
      <App />
    )

    expect(
      screen.getByRole(
        'alert'
      )
    ).toHaveTextContent(
      'ForgePass is temporarily unavailable'
    )

    expect(
      provider
    ).not.toHaveBeenCalled()
  },
)