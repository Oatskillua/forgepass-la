import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import SharedItinerary from './SharedItinerary'

const api = vi.hoisted(() => ({ getSharedItinerary: vi.fn() }))
vi.mock('../lib/itinerarySharing', () => api)
vi.mock('../components/PageShell', () => ({ default: ({ title, children }) => <main><h1>{title}</h1>{children}</main> }))
beforeEach(() => vi.resetAllMocks())
const page = (hash = 'token') => <MemoryRouter key={hash} initialEntries={['/shared-trip#' + hash]}><SharedItinerary /></MemoryRouter>

it('loads without sign-in and clears a revoked trip on refresh', async () => {
  api.getSharedItinerary.mockResolvedValueOnce({ name: 'Weekend', stops: [{ title: 'Museum', starts_at: null }] }).mockResolvedValueOnce(null)
  render(page())
  await screen.findByText('1. Museum')
  expect(api.getSharedItinerary).toHaveBeenCalledWith('token')
  fireEvent.click(screen.getByText('Refresh shared trip'))
  expect(screen.queryByText('1. Museum')).not.toBeInTheDocument()
  await screen.findByText(/This link is unavailable/)
})

it('allows retry after a failed load', async () => {
  api.getSharedItinerary.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ name: 'Weekend', stops: [] })
  render(page())
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load')
  fireEvent.click(screen.getByText('Refresh shared trip'))
  await screen.findByText('No stops added yet.')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('ignores an old link response after navigating to another link', async () => {
  let resolve
  api.getSharedItinerary.mockReturnValueOnce(new Promise((done) => { resolve = done })).mockResolvedValueOnce(null)
  const view = render(page('old'))
  view.rerender(page('new'))
  await screen.findByText(/This link is unavailable/)
  await act(async () => resolve({ name: 'Old private trip', stops: [] }))
  expect(screen.queryByText('Old private trip')).not.toBeInTheDocument()
})
