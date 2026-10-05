import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import UserDashboard from './UserDashboard'

const api = vi.hoisted(() => ({ getUserSummary: vi.fn(), signOut: vi.fn() }))
vi.mock('../lib/userData', () => ({ getUserSummary: api.getUserSummary }))
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1', email: 'owner@example.com' }, signOut: api.signOut }) }))
vi.mock('../components/app/AppNav', () => ({ default: () => null }))
vi.mock('../components/PageShell', () => ({ default: ({ children }) => <main>{children}</main> }))
beforeEach(() => {
  vi.resetAllMocks()
  api.getUserSummary.mockResolvedValue({ favoriteCount: 7, savedEventCount: 3, itineraryCount: 2 })
})
function open() { render(<MemoryRouter><UserDashboard /></MemoryRouter>) }

it('keeps navigation available during failed count loading and supports retry', async () => {
  api.getUserSummary.mockRejectedValueOnce(new Error('Offline'))
  open()
  expect(screen.getByRole('status')).toHaveTextContent('Loading account counts')
  await screen.findByRole('alert')
  expect(screen.getAllByText('—')).toHaveLength(3)
  expect(screen.queryByText('0')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'View saved content' })).toHaveAttribute('href', '/app/saved')
  fireEvent.click(screen.getByText('Retry account counts'))
  await screen.findByText('7')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it.each(['returned', 'thrown'])('reports a %s sign-out error and permits retry', async (kind) => {
  if (kind === 'returned') api.signOut.mockResolvedValueOnce({ error: new Error('Offline') })
  else api.signOut.mockRejectedValueOnce(new Error('Offline'))
  open()
  await screen.findByText('7')
  fireEvent.click(screen.getByText('Sign out'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Sign-out could not be confirmed')
  let finish
  api.signOut.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
  fireEvent.click(screen.getByText('Sign out'))
  const pending = screen.getByText('Signing out…')
  fireEvent.click(pending)
  expect(pending).toBeDisabled()
  expect(api.signOut).toHaveBeenCalledTimes(2)
  await act(async () => { finish({ error: null }) })
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
