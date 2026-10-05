import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import Profile from './Profile'

const api = vi.hoisted(() => ({ getAccountSettings: vi.fn(), saveAccountSettings: vi.fn() }))
vi.mock('../lib/userData', () => api)
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('../components/app/AppNav', () => ({ default: () => null }))
vi.mock('../components/PageShell', () => ({ default: ({ children }) => <main>{children}</main> }))
beforeEach(() => {
  vi.resetAllMocks()
  api.getAccountSettings.mockResolvedValue({ profile: { full_name: 'Owner', home_city: 'LA' }, preferences: {
    event_reminders: true, city_alerts: true, transportation: true, rewards: true, marketing: false,
  } })
})

it('blocks default-value saves until settings load and supports retry', async () => {
  api.getAccountSettings.mockRejectedValueOnce(new Error('Offline'))
  render(<Profile />)
  expect(screen.getByText('Save changes')).toBeDisabled()
  await screen.findByRole('alert')
  expect(screen.getByLabelText('Full name')).toBeDisabled()
  fireEvent.click(screen.getByText('Retry settings'))
  await screen.findByDisplayValue('Owner')
  expect(screen.getByText('Save changes')).toBeEnabled()
  expect(api.saveAccountSettings).not.toHaveBeenCalled()
})

it('preserves failed edits and reports success only after a confirmed retry', async () => {
  api.saveAccountSettings.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(undefined)
  render(<Profile />)
  await screen.findByDisplayValue('Owner')
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'New name' } })
  fireEvent.click(screen.getByLabelText('Marketing messages'))
  fireEvent.click(screen.getByText('Save changes'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not confirm')
  expect(screen.getByLabelText('Full name')).toHaveValue('New name')
  expect(screen.getByLabelText('Marketing messages')).toBeChecked()
  fireEvent.click(screen.getByText('Save changes'))
  expect(await screen.findByRole('status')).toHaveTextContent('preferences saved')
  expect(api.saveAccountSettings).toHaveBeenLastCalledWith({ full_name: 'New name', home_city: 'LA' }, expect.objectContaining({ marketing: true }))
  fireEvent.change(screen.getByLabelText('Home city'), { target: { value: 'Pasadena' } })
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('locks fields and prevents duplicate saves while a request is pending', async () => {
  let finish
  api.saveAccountSettings.mockReturnValue(new Promise((resolve) => { finish = resolve }))
  render(<Profile />)
  await screen.findByDisplayValue('Owner')
  fireEvent.click(screen.getByText('Save changes'))
  fireEvent.click(screen.getByText('Save changes'))
  expect(api.saveAccountSettings).toHaveBeenCalledTimes(1)
  expect(screen.getByLabelText('Full name')).toBeDisabled()
  await act(async () => { finish() })
  expect(screen.getByLabelText('Full name')).toBeEnabled()
})
