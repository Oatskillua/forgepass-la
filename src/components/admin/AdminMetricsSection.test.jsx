import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import AdminMetricsSection from './AdminMetricsSection'
vi.mock('./AdminWaitlistSection', () => ({ default: () => null }))
vi.mock('./AdminFeedbackSection', () => ({ default: () => null }))
const metrics = { waitlistCount: 7, feedbackCount: 2, environment: 'staging' }
const reply = (data) => ({ ok: true, json: async () => data })
let createUrl, revokeUrl, click
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(metrics)))
  createUrl = vi.fn(() => 'blob:test-export')
  revokeUrl = vi.fn()
  vi.stubGlobal('URL', class extends URL { static createObjectURL = createUrl; static revokeObjectURL = revokeUrl })
  click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

it('retries invalid metrics without inventing zero counts', async () => {
  fetch.mockResolvedValueOnce(reply({}))
  render(<AdminMetricsSection accessToken="test-token" />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to confirm')
  expect(screen.getAllByText('—')).toHaveLength(3)
  fireEvent.click(screen.getByText('Refresh metrics'))
  await screen.findByText('7')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('rejects non-CSV responses then downloads a confirmed CSV on retry', async () => {
  render(<AdminMetricsSection accessToken="test-token" />)
  await screen.findByText('7')
  fetch.mockResolvedValueOnce({ ok: true, headers: new Headers({ 'content-type': 'text/html' }) })
  fireEvent.click(screen.getByText('Export Waitlist CSV'))
  expect(await screen.findByRole('alert')).toHaveTextContent('could not be downloaded')
  expect(createUrl).not.toHaveBeenCalled()
  const blob = new Blob(['id,name\n1,Test'], { type: 'text/csv' })
  fetch.mockResolvedValueOnce({ ok: true, headers: new Headers({ 'content-type': 'text/csv; charset=utf-8' }), blob: async () => blob })
  fireEvent.click(screen.getByText('Export Waitlist CSV'))
  await act(async () => {})
  expect(createUrl).toHaveBeenCalledWith(blob)
  expect(click).toHaveBeenCalledTimes(1)
  expect(revokeUrl).toHaveBeenCalledWith('blob:test-export')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('blocks overlapping exports and cancels downloads when unmounted', async () => {
  const view = render(<AdminMetricsSection accessToken="test-token" />)
  await screen.findByText('7')
  let finish
  fetch.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
  fireEvent.click(screen.getByText('Export Feedback CSV'))
  expect(screen.getByText('Export Waitlist CSV')).toBeDisabled()
  fireEvent.click(screen.getByText('Export Waitlist CSV'))
  expect(fetch).toHaveBeenCalledTimes(2)
  const signal = fetch.mock.calls[1][1].signal
  view.unmount()
  expect(signal.aborted).toBe(true)
  await act(async () => { finish({ ok: true, headers: new Headers({ 'content-type': 'text/csv' }), blob: async () => new Blob(['test']) }) })
  expect(createUrl).not.toHaveBeenCalled()
})
