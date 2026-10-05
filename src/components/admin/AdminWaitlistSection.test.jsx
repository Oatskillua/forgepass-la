import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import AdminWaitlistSection from './AdminWaitlistSection'
const reply = (data, status = 200) => ({ ok: status < 400, json: async () => data })
const entries = [{ id: 'w1', name: 'Test entrant', email: 'test@example.com' }]
beforeEach(() => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ entries }))) })
afterEach(() => { vi.unstubAllGlobals() })

it('retries malformed responses without claiming the waitlist is empty', async () => {
  fetch.mockResolvedValueOnce(reply({}))
  render(<AdminWaitlistSection accessToken="test-token" />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to confirm')
  expect(screen.queryByText('No waitlist entries yet.')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Refresh waitlist'))
  await screen.findByText('test@example.com')
  expect(fetch).toHaveBeenLastCalledWith('/api/admin-waitlist', expect.objectContaining({ cache: 'no-store', headers: { Authorization: 'Bearer test-token' } }))
})

it('clears displayed entries when refresh is denied', async () => {
  render(<AdminWaitlistSection accessToken="test-token" />)
  await screen.findByText('test@example.com')
  fetch.mockResolvedValueOnce(reply({ error: 'Access denied' }, 403))
  fireEvent.click(screen.getByText('Refresh waitlist'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Access denied')
  expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()
})

it('aborts old-session loads and ignores their late results', async () => {
  let finish
  fetch.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
  const view = render(<AdminWaitlistSection accessToken="old-token" />)
  const signal = fetch.mock.calls[0][1].signal
  fetch.mockResolvedValueOnce(reply({ entries: [] }))
  view.rerender(<AdminWaitlistSection accessToken="new-token" />)
  expect(signal.aborted).toBe(true)
  await screen.findByText('No waitlist entries yet.')
  await act(async () => { finish(reply({ entries })) })
  expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()
})
