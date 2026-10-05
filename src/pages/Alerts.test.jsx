import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import Alerts from './Alerts'

const api = vi.hoisted(() => ({ getNotifications: vi.fn(), markNotificationRead: vi.fn(), markAllNotificationsRead: vi.fn() }))
vi.mock('../lib/userData', () => api)
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('../components/app/AppNav', () => ({ default: () => null }))
vi.mock('../components/PageShell', () => ({ default: ({ children }) => <main>{children}</main> }))
beforeEach(() => {
  vi.resetAllMocks()
  api.getNotifications.mockResolvedValue([
    { id: 'n1', title: 'First', read_at: null }, { id: 'n2', title: 'Second', read_at: null },
  ])
})

it('retries failed loads without claiming there are no alerts', async () => {
  api.getNotifications.mockRejectedValueOnce(new Error('Offline'))
  render(<Alerts />)
  expect(screen.getByRole('status')).toHaveTextContent('Loading alerts')
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load alerts')
  expect(screen.queryByText('No alerts yet.')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Retry alerts'))
  await screen.findByText('First')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('loads older pages, keeps the current page on failure, and returns to latest', async () => {
  const first = Array.from({ length: 100 }, (_, index) => ({ id: 'n' + index, title: 'Alert ' + index, created_at: '2026-09-19T10:00:00Z', read_at: null }))
  api.getNotifications.mockResolvedValueOnce(first).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([{ id: 'older', title: 'Older entry', read_at: null }])
  api.markAllNotificationsRead.mockResolvedValue([])
  render(<Alerts />)
  await screen.findByText('Alert 99')
  fireEvent.click(screen.getByText('Older alerts'))
  expect(await screen.findByRole('alert')).toHaveTextContent('current page is unchanged')
  expect(screen.getByText('Alert 99')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Older alerts'))
  await screen.findByText('Older entry')
  expect(api.getNotifications).toHaveBeenLastCalledWith('u1', { id: 'n99', created_at: '2026-09-19T10:00:00Z' })
  expect(screen.queryByText('Alert 99')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Mark shown alerts read'))
  await act(async () => {})
  expect(api.markAllNotificationsRead).toHaveBeenCalledWith('u1', ['older'])
  fireEvent.click(screen.getByText('Show latest alerts'))
  await screen.findByText('First')
  expect(api.getNotifications).toHaveBeenLastCalledWith('u1')
})

it('marks only confirmed rows read and prevents repeat submissions', async () => {
  let finish
  api.markAllNotificationsRead.mockReturnValue(new Promise((resolve) => { finish = resolve }))
  render(<Alerts />)
  await screen.findByText('First')
  const button = screen.getByText('Mark shown alerts read')
  fireEvent.click(button)
  fireEvent.click(button)
  expect(api.markAllNotificationsRead).toHaveBeenCalledExactlyOnceWith('u1', ['n1', 'n2'])
  expect(screen.getByRole('button', { name: 'Mark First read' })).toBeDisabled()
  await act(async () => { finish([{ id: 'n1', read_at: '2026-09-19T10:00:00Z' }]) })
  expect(screen.queryByRole('button', { name: 'Mark First read' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mark Second read' })).toBeEnabled()
  expect(screen.getByText(/1 unread among/)).toBeInTheDocument()
})

it('preserves unread status after a failed update and clears the error on success', async () => {
  api.markNotificationRead.mockRejectedValueOnce(new Error('Not confirmed')).mockResolvedValueOnce({ id: 'n1', read_at: '2026-09-19T10:00:00Z' })
  render(<Alerts />)
  fireEvent.click(await screen.findByRole('button', { name: 'Mark First read' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Not confirmed')
  expect(screen.getByText(/2 unread among/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Mark First read' }))
  await screen.findByText(/1 unread among/)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
