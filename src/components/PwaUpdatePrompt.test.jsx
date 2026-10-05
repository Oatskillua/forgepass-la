import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import PwaUpdatePrompt from './PwaUpdatePrompt'

const sw = vi.hoisted(() => ({ offline: false, refresh: true, setOffline: vi.fn(), setRefresh: vi.fn(), update: vi.fn() }))
vi.mock('virtual:pwa-register/react', () => ({ useRegisterSW: () => ({
  offlineReady: [sw.offline, sw.setOffline], needRefresh: [sw.refresh, sw.setRefresh], updateServiceWorker: sw.update,
}) }))
beforeEach(() => { vi.resetAllMocks(); sw.offline = false; sw.refresh = true })

it('does not apply an update automatically and lets users dismiss it', () => {
  render(<PwaUpdatePrompt />)
  expect(screen.getByText('Save your work before reloading.')).toBeInTheDocument()
  expect(sw.update).not.toHaveBeenCalled()
  fireEvent.click(screen.getByText('Dismiss'))
  expect(sw.setRefresh).toHaveBeenCalledWith(false)
  expect(sw.update).not.toHaveBeenCalled()
})

it('blocks duplicate update requests and allows retry after failure', async () => {
  let fail
  sw.update.mockReturnValueOnce(new Promise((resolve, reject) => { fail = reject })).mockResolvedValueOnce(undefined)
  render(<PwaUpdatePrompt />)
  fireEvent.click(screen.getByText('Reload'))
  fireEvent.click(screen.getByText('Updating…'))
  expect(sw.update).toHaveBeenCalledExactlyOnceWith(true)
  expect(screen.getByText('Dismiss')).toBeDisabled()
  await act(async () => { fail(new Error('Offline')) })
  expect(screen.getByRole('alert')).toHaveTextContent('page is still open')
  fireEvent.click(screen.getByText('Reload'))
  await act(async () => {})
  expect(sw.update).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('limits offline readiness messaging to cached app assets', () => {
  sw.refresh = false; sw.offline = true
  render(<PwaUpdatePrompt />)
  expect(screen.getByRole('status')).toHaveTextContent('Events and account data require a connection')
  expect(screen.queryByText('Reload')).not.toBeInTheDocument()
})
