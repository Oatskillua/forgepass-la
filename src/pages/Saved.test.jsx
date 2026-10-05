import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import Saved from './Saved'

const api = vi.hoisted(() => ({ getSavedContent: vi.fn(), removeSavedItem: vi.fn() }))
vi.mock('../lib/userData', () => api)
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('../components/app/AppNav', () => ({ default: () => null }))
vi.mock('../components/PageShell', () => ({ default: ({ children }) => <main>{children}</main> }))

beforeEach(() => {
  vi.resetAllMocks()
  api.getSavedContent.mockResolvedValue({ favorites: [{ id: 'p1', place_name: 'Museum' }], events: [{ id: 'e1', event_name: 'Concert' }] })
})

it('retries loading failures without displaying an empty collection', async () => {
  api.getSavedContent.mockRejectedValueOnce(new Error('Offline'))
  render(<Saved />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load')
  expect(screen.queryByText('Nothing saved yet.')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Retry saved content'))
  await screen.findByText('Museum')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('waits for confirmed deletion and prevents duplicate requests', async () => {
  let resolveRemoval
  api.removeSavedItem.mockReturnValue(new Promise((resolve) => { resolveRemoval = resolve }))
  render(<Saved />)
  const remove = await screen.findByRole('button', { name: 'Remove Museum' })
  fireEvent.click(remove)
  fireEvent.click(remove)
  expect(api.removeSavedItem).toHaveBeenCalledTimes(1)
  expect(api.removeSavedItem).toHaveBeenCalledWith('favorites', 'p1')
  expect(screen.getByText('Museum')).toBeInTheDocument()
  expect(screen.getByText('Refresh saved content')).toBeDisabled()
  await act(async () => { resolveRemoval({ id: 'p1' }) })
  expect(screen.queryByText('Museum')).not.toBeInTheDocument()
  expect(screen.getByText('Concert')).toBeInTheDocument()
})

it('retains failed deletions and reconciles them through refresh', async () => {
  api.removeSavedItem.mockRejectedValue(new Error('Unable to confirm removal'))
  render(<Saved />)
  fireEvent.click(await screen.findByRole('button', { name: 'Remove Concert' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to confirm')
  expect(screen.getByText('Concert')).toBeInTheDocument()
  api.getSavedContent.mockResolvedValue({ favorites: [], events: [] })
  fireEvent.click(screen.getByText('Refresh saved content'))
  await waitFor(() => expect(screen.getAllByText('Nothing saved yet.')).toHaveLength(2))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('clears a previous removal error after a successful retry', async () => {
  api.removeSavedItem.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ id: 'e1' })
  render(<Saved />)
  fireEvent.click(await screen.findByRole('button', { name: 'Remove Concert' }))
  await screen.findByRole('alert')
  fireEvent.click(screen.getByRole('button', { name: 'Remove Concert' }))
  await waitFor(() => expect(screen.queryByText('Concert')).not.toBeInTheDocument())
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(api.removeSavedItem).toHaveBeenLastCalledWith('saved_events', 'e1')
})
