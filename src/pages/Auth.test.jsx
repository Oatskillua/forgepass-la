import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Auth from './Auth'

const api = vi.hoisted(() => ({ signInWithPassword: vi.fn(), signUp: vi.fn(), resetPasswordForEmail: vi.fn() }))
const auth = vi.hoisted(() => ({ user: null, loading: false }))
vi.mock('../lib/supabase', () => ({ supabase: { auth: api } }))
vi.mock('../auth/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../components/PageShell', () => ({ default: ({ children }) => <main>{children}</main> }))
beforeEach(() => { vi.resetAllMocks(); auth.user = null; auth.loading = false })
afterEach(() => vi.unstubAllEnvs())
function open(from = '/app/saved', mode) {
  return render(<MemoryRouter initialEntries={[{ pathname: '/auth', state: { from, mode } }]}><Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/app" element={<p>Dashboard destination</p>} />
    <Route path="/app/saved" element={<p>Saved destination</p>} />
  </Routes></MemoryRouter>)
}
function credentials() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } })
}

it('opens the reset form directly for expired recovery links', () => {
  open('/app', 'reset')
  expect(screen.getByText('Send reset link')).toBeInTheDocument()
  expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
})

it('uses the configured public website for recovery emails', async () => {
  vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://forgepass.example')
  api.resetPasswordForEmail.mockResolvedValue({ error: null })
  open('/app', 'reset')
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.com' } })
  fireEvent.click(screen.getByText('Send reset link'))
  await screen.findByRole('status')
  expect(api.resetPasswordForEmail).toHaveBeenCalledWith('owner@example.com', { redirectTo: 'https://forgepass.example/auth/update-password' })
})

it('blocks recovery with an invalid website origin without sending email or losing the draft', async () => {
  vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://forgepass.example/wrong-path')
  open('/app', 'reset')
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.com' } })
  fireEvent.click(screen.getByText('Send reset link'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Website links are unavailable')
  expect(api.resetPasswordForEmail).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Email')).toHaveValue('owner@example.com')
  expect(screen.getByText('Send reset link')).toBeEnabled()
})

it('locks reset requests and mode switching until completion', async () => {
  let finish
  api.resetPasswordForEmail.mockReturnValue(new Promise((resolve) => { finish = resolve }))
  open()
  fireEvent.click(screen.getByText('Forgot password?'))
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.com' } })
  fireEvent.click(screen.getByText('Send reset link'))
  fireEvent.click(screen.getByText('Working…'))
  fireEvent.click(screen.getByText('Create account'))
  expect(screen.getByLabelText('Email')).toBeDisabled()
  expect(api.resetPasswordForEmail).toHaveBeenCalledTimes(1)
  expect(api.resetPasswordForEmail).toHaveBeenCalledWith('owner@example.com', { redirectTo: expect.stringMatching(/\/auth\/update-password$/) })
  await act(async () => { finish({ error: null }) })
  expect(screen.getByRole('status')).toHaveTextContent('if the account exists')
  expect(screen.getByText('Send reset link')).toBeEnabled()
})

it('recovers from a thrown sign-in failure and returns to the requested page', async () => {
  api.signInWithPassword.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ error: null })
  open()
  credentials()
  fireEvent.click(screen.getByText('Sign in'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Offline')
  expect(screen.getByLabelText('Email')).toHaveValue('owner@example.com')
  fireEvent.click(screen.getByText('Sign in'))
  await screen.findByText('Saved destination')
})

it('validates signup names and clears passwords when changing modes', async () => {
  api.signUp.mockResolvedValue({ data: { session: null }, error: null })
  open()
  credentials()
  fireEvent.click(screen.getByText('Create account'))
  expect(screen.getByLabelText('Password')).toHaveValue('')
  credentials()
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: '   ' } })
  fireEvent.click(screen.getByText('Create account'))
  expect(screen.getByRole('alert')).toHaveTextContent('Enter your name')
  expect(api.signUp).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: ' Owner ' } })
  fireEvent.click(screen.getByText('Create account'))
  expect(await screen.findByRole('status')).toHaveTextContent('verify your account')
  expect(api.signUp).toHaveBeenCalledWith(expect.objectContaining({ options: { data: { full_name: 'Owner' } } }))
})

it('waits for session resolution and rejects an unrecognized return destination', async () => {
  auth.loading = true
  const view = open('https://untrusted.example')
  expect(screen.getByRole('status')).toHaveTextContent('Checking your session')
  expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
  view.unmount()
  auth.loading = false
  auth.user = { id: 'u1' }
  open('https://untrusted.example')
  await screen.findByText('Dashboard destination')
})
