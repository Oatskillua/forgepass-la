import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import AdminFeedbackSection from './AdminFeedbackSection'
const entries = [{ id: 'f1', status: 'new', message: 'First message' }, { id: 'f2', status: 'new', message: 'Second message' }]
const reply = (data, status = 200) => ({ ok: status < 400, status, json: async () => data })
beforeEach(() => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ entries }))) })
afterEach(() => { vi.unstubAllGlobals() })

it('preserves current status on an unconfirmed response and permits retry', async () => {
  fetch.mockResolvedValueOnce(reply({ entries })).mockResolvedValueOnce(reply({})).mockResolvedValueOnce(reply({ ok: true }))
  render(<AdminFeedbackSection accessToken="test-token" />)
  const select = await screen.findByLabelText('Status for feedback f1')
  fireEvent.change(select, { target: { value: 'reviewed' } })
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to confirm')
  expect(screen.getByText('First message')).toBeInTheDocument()
  expect(select).toHaveValue('new')
  fireEvent.change(select, { target: { value: 'reviewed' } })
  await act(async () => {})
  expect(select).toHaveValue('reviewed')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('locks all status controls until the current update completes', async () => {
  let finish
  fetch.mockResolvedValueOnce(reply({ entries })).mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
  render(<AdminFeedbackSection accessToken="test-token" />)
  fireEvent.change(await screen.findByLabelText('Status for feedback f1'), { target: { value: 'planned' } })
  const other = screen.getByLabelText('Status for feedback f2')
  expect(other).toBeDisabled()
  fireEvent.change(other, { target: { value: 'completed' } })
  expect(fetch).toHaveBeenCalledTimes(2)
  expect(screen.getByText('Refresh feedback')).toBeDisabled()
  await act(async () => { finish(reply({ ok: true })) })
  expect(screen.getByLabelText('Status for feedback f1')).toHaveValue('planned')
  expect(other).toHaveValue('new')
})

it('clears entries after administrator access is denied', async () => {
  fetch.mockResolvedValueOnce(reply({ entries })).mockResolvedValueOnce(reply({ error: 'Forbidden' }, 403))
  render(<AdminFeedbackSection accessToken="test-token" />)
  fireEvent.change(await screen.findByLabelText('Status for feedback f1'), { target: { value: 'reviewed' } })
  expect(await screen.findByRole('alert')).toHaveTextContent('Administrator access')
  expect(screen.queryByText('First message')).not.toBeInTheDocument()
})

it('sends the displayed original status and preserves it on a conflict', async () => {
  fetch.mockResolvedValueOnce(reply({ entries })).mockResolvedValueOnce(reply({ error: 'Changed' }, 409))
  render(<AdminFeedbackSection accessToken="test-token" />)
  const select = await screen.findByLabelText('Status for feedback f1')
  fireEvent.change(select, { target: { value: 'completed' } })
  expect(await screen.findByRole('alert')).toHaveTextContent('Refresh feedback before updating again')
  expect(select).toHaveValue('new')
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ feedbackId: 'f1', status: 'completed', expectedStatus: 'new' })
})

it('retries failed loading and sends the bearer token', async () => {
  fetch.mockRejectedValueOnce(new Error('Offline'))
  render(<AdminFeedbackSection accessToken="test-token" />)
  await screen.findByRole('alert')
  fireEvent.click(screen.getByText('Refresh feedback'))
  await screen.findByText('First message')
  expect(fetch).toHaveBeenLastCalledWith('/api/admin-feedback', { headers: { Authorization: 'Bearer test-token' } })
})
