import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Admin from './Admin'
const auth = vi.hoisted(() => ({ session: { access_token: 'token-a' }, loading: false }))
vi.mock('../auth/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../components/PageShell', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../components/admin/AdminMetricsSection', () => ({ default: () => <p>Verified operations</p> }))
const success = () => ({ ok: true, json: async () => ({ waitlistCount: 0, feedbackCount: 0 }) })
beforeEach(() => {
  auth.session = { access_token: 'token-a' }; auth.loading = false
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(success()))
})
afterEach(() => { vi.unstubAllGlobals() })
function page() { return <MemoryRouter><Admin /></MemoryRouter> }

it('retries failed verification without opening the dashboard prematurely', async () => {
  fetch.mockRejectedValueOnce(new Error('Offline'))
  render(page())
  await screen.findByRole('alert')
  expect(screen.queryByText('Verified operations')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Retry administrator access'))
  await screen.findByText('Verified operations')
  expect(fetch).toHaveBeenCalledTimes(2)
})

it('rejects malformed successful responses', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })
  render(page())
  expect(await screen.findByRole('alert')).toHaveTextContent('invalid response')
  expect(screen.queryByText('Verified operations')).not.toBeInTheDocument()
})

it('does not accept an old verification result after the session changes', async () => {
  let finish
  fetch.mockReturnValueOnce(new Promise((resolve) => { finish = resolve })).mockResolvedValueOnce({ ok: false })
  const view = render(page())
  const signal = fetch.mock.calls[0][1].signal
  auth.session = { access_token: 'token-b' }
  view.rerender(page())
  await screen.findByRole('alert')
  await act(async () => { finish(success()) })
  expect(signal.aborted).toBe(true)
  expect(screen.queryByText('Verified operations')).not.toBeInTheDocument()
})
