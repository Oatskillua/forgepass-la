import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import LiveEventsSection from './LiveEventsSection'

const api = vi.hoisted(() => ({ saveEvent: vi.fn() }))
const auth = vi.hoisted(() => ({ user: { id: 'u1' } }))
vi.mock('../../lib/userData', () => api)
vi.mock('../../auth/AuthContext', () => ({ useAuth: () => auth }))
const event = { id: 'e1', name: 'LA Concert', venue: 'Theater' }
beforeEach(() => {
  vi.resetAllMocks()
  auth.user = { id: 'u1' }
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ events: [event] }) }))
})
afterEach(() => { vi.unstubAllGlobals() })
function page() { return <MemoryRouter><LiveEventsSection /></MemoryRouter> }

it('browses pages and resets to the first page for a new search', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ events: [event], page: 0, hasMore: true }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ events: [{ ...event, id: 'e2', name: 'Second concert' }], page: 1, hasMore: false }) })
  render(page())
  await screen.findByRole('heading', { name: 'LA Concert' })
  expect(screen.getByText('Previous events')).toBeDisabled()
  fireEvent.click(screen.getByText('Next events'))
  expect(screen.getByText('Next events')).toBeDisabled()
  await screen.findByRole('heading', { name: 'Second concert' })
  expect(screen.getByText('Page 2')).toBeInTheDocument()
  expect(fetch.mock.calls[1][0]).toContain('page=1')
  expect(screen.getByText('Next events')).toBeDisabled()
  fireEvent.change(screen.getByLabelText('Search events'), { target: { value: 'Jazz' } })
  await screen.findByRole('heading', { name: 'LA Concert' })
  expect(fetch.mock.calls[2][0]).toContain('page=0')
  expect(fetch.mock.calls[2][0]).toContain('keyword=Jazz')
  expect(screen.getByText('Page 1')).toBeInTheDocument()
})

it('retries the failed page and allows returning to an earlier page', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ events: [event], page: 0, hasMore: true }) })
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ events: [], page: 1, hasMore: false }) })
  render(page())
  await screen.findByRole('heading', { name: 'LA Concert' })
  fireEvent.click(screen.getByText('Next events'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Offline')
  expect(screen.queryByText('No events found.')).not.toBeInTheDocument()
  expect(screen.getByText('Previous events')).toBeEnabled()
  fireEvent.click(screen.getByText('Retry events'))
  await screen.findByText('Page 2')
  expect(fetch.mock.calls[2][0]).toContain('page=1')
  fireEvent.click(screen.getByText('Previous events'))
  await screen.findByText('Page 1')
  expect(fetch.mock.calls[3][0]).toContain('page=0')
})

it('keeps listings visible on save failure and supports a confirmed retry', async () => {
  api.saveEvent.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(undefined)
  render(page())
  fireEvent.click(await screen.findByRole('button', { name: 'Save LA Concert' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to confirm')
  expect(screen.getByRole('heading', { name: 'LA Concert' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Save LA Concert' }))
  expect(await screen.findByRole('button', { name: 'Saved LA Concert' })).toBeDisabled()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('blocks duplicate saves and isolates pending saves across accounts', async () => {
  let finish
  api.saveEvent.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
  const view = render(page())
  const button = await screen.findByRole('button', { name: 'Save LA Concert' })
  fireEvent.click(button)
  fireEvent.click(button)
  expect(api.saveEvent).toHaveBeenCalledExactlyOnceWith('u1', event)
  expect(button).toBeDisabled()
  auth.user = { id: 'u2' }
  view.rerender(page())
  await act(async () => { finish() })
  expect(screen.getByRole('button', { name: 'Save LA Concert' })).toBeEnabled()
  expect(screen.queryByText('Saved')).not.toBeInTheDocument()
})

it('retries invalid event responses instead of reporting no events', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })
  render(page())
  await screen.findByRole('alert')
  expect(screen.queryByText('No events found.')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Retry events'))
  await screen.findByRole('heading', { name: 'LA Concert' })
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('offers sign-in instead of saving anonymously', async () => {
  auth.user = null
  render(page())
  expect(await screen.findByRole('link', { name: 'Sign in to save' })).toHaveAttribute('href', '/auth')
  expect(api.saveEvent).not.toHaveBeenCalled()
})
